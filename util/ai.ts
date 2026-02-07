import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from '@langchain/core/messages';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import z from 'zod';
import { scoreToColor } from '@/util/color';

const analysisSchema = z.object({
  mood: z
    .string()
    .describe(
      'A single word or short phrase for the overall mood (e.g. "happy", "anxious", "bittersweet", "grateful").'
    ),
  subject: z
    .string()
    .describe('The main topic or subject of the journal entry in a few words.'),
  negative: z
    .boolean()
    .describe(
      'True if the entry is predominantly negative in tone, false otherwise. Mixed entries that end positively should be false.'
    ),
  summary: z
    .string()
    .describe(
      'A concise 1-2 sentence summary capturing the key events and emotions.'
    ),
  sentimentScore: z
    .number()
    .describe(
      'A sentiment score from -10 to 10. -10 is extremely negative (despair, rage), -5 is moderately negative (frustration, sadness), 0 is neutral, 5 is moderately positive (contentment, hope), 10 is extremely positive (elation, triumph). Consider the overall arc — if something starts bad but ends well, weight the ending more.'
    ),
});

// Schema for Q&A responses with entry references
const qaResponseSchema = z.object({
  answer: z
    .string()
    .describe('The natural conversational answer to the user question.'),
  referencedEntries: z
    .array(
      z.object({
        id: z.string().describe('The entry ID'),
        date: z.string().describe('The date of the entry (YYYY-MM-DD)'),
        subject: z.string().describe('Brief subject/topic of the entry'),
        sentimentScore: z.number().describe('The sentiment score of the entry'),
      })
    )
    .describe(
      'Array of journal entries that are directly relevant to the answer. Include entries when discussing specific days, events, or moments. For "best days" include top positive entries, for "worst days" include most negative entries.'
    ),
});

const getPrompt = async (content: string) => {
  const prompt = new PromptTemplate({
    template: `Analyze the following journal entry. Pay close attention to the overall emotional arc — if the entry starts negative but ends positive (or vice versa), weight the conclusion more heavily in your scoring.

ENTRY:
{entry}`,
    inputVariables: ['entry'],
  });
  return prompt.format({ entry: content });
};

export const analyzeEntry = async (entry: { content: string }) => {
  const input = await getPrompt(entry.content);

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });

  const structured = model.withStructuredOutput(analysisSchema);
  const result = await structured.invoke(input);

  return {
    ...result,
    color: scoreToColor(result.sentimentScore),
  };
};

export type QAResponse = {
  answer: string;
  referencedEntries: Array<{
    id: string;
    date: string;
    subject: string;
    sentimentScore: number;
  }>;
};

export const qa = async (
  question: string,
  entries: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
    analysis?: {
      mood: string;
      subject: string;
      summary: string;
      negative: boolean;
      sentimentScore: number;
    } | null;
  }>,
  history: Array<{ role: 'human' | 'ai'; content: string }> = []
): Promise<QAResponse> => {
  const docs = entries.map((entry) => {
    const dateStr =
      entry.createdAt instanceof Date
        ? entry.createdAt.toISOString().split('T')[0]
        : new Date(entry.createdAt).toISOString().split('T')[0];

    let enrichedContent = `[Entry ID: ${entry.id}]\n`;
    enrichedContent += `[Date: ${dateStr}]\n`;

    if (entry.analysis) {
      enrichedContent += `[Mood: ${entry.analysis.mood}]\n`;
      enrichedContent += `[Subject: ${entry.analysis.subject}]\n`;
      enrichedContent += `[Summary: ${entry.analysis.summary}]\n`;
      enrichedContent += `[Sentiment: ${entry.analysis.sentimentScore}/10]\n`;
      enrichedContent += `[Negative: ${entry.analysis.negative}]\n`;
    }

    enrichedContent += `\n${entry.content}`;

    return new Document({
      pageContent: enrichedContent,
      metadata: {
        source: entry.id,
        date: dateStr,
        subject: entry.analysis?.subject || 'Journal entry',
        sentimentScore: entry.analysis?.sentimentScore ?? 0,
      },
    });
  });

  // Detect if user is asking for best/worst days
  const lowerQ = question.toLowerCase();
  const isBestWorstQuery =
    lowerQ.includes('best day') ||
    lowerQ.includes('worst day') ||
    lowerQ.includes('happiest') ||
    lowerQ.includes('saddest') ||
    lowerQ.includes('most positive') ||
    lowerQ.includes('most negative') ||
    lowerQ.includes('top days') ||
    lowerQ.includes('good days') ||
    lowerQ.includes('bad days');

  let relevantDocs: Document[];

  if (isBestWorstQuery) {
    // Sort all entries by sentiment and pick top/bottom
    const sortedDocs = [...docs].sort(
      (a, b) =>
        (b.metadata.sentimentScore as number) -
        (a.metadata.sentimentScore as number)
    );

    if (
      lowerQ.includes('worst') ||
      lowerQ.includes('saddest') ||
      lowerQ.includes('negative') ||
      lowerQ.includes('bad')
    ) {
      // Get bottom entries (most negative)
      relevantDocs = sortedDocs.slice(-10).reverse();
    } else {
      // Get top entries (most positive)
      relevantDocs = sortedDocs.slice(0, 10);
    }
  } else {
    // Normal similarity search
    const llm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 });
    const embeddings = new OpenAIEmbeddings();
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
    relevantDocs = await store.similaritySearch(question, 6);
  }

  const context = relevantDocs
    .map((doc) => doc.pageContent)
    .join('\n\n---\n\n');

  // Build entry reference info for the model
  const availableEntries = relevantDocs.map((doc) => ({
    id: doc.metadata.source as string,
    date: doc.metadata.date as string,
    subject: doc.metadata.subject as string,
    sentimentScore: doc.metadata.sentimentScore as number,
  }));

  const llm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 });
  const structuredLlm = llm.withStructuredOutput(qaResponseSchema);

  const messages = [
    new SystemMessage(
      `You are a helpful, friendly assistant that answers questions about the user's journal entries. ` +
        `You have access to their journal entries below. Answer questions naturally and conversationally — ` +
        `be concise, warm, and direct. When mentioning specific days, just use the date (like "November 15th" or "last Tuesday").\n\n` +
        `When the user asks about their "best days", "happiest moments", or similar, list the most positive entries. ` +
        `When they ask about "worst days" or "hardest times", list the most negative entries.\n\n` +
        `IMPORTANT FORMATTING RULES:\n` +
        `- NEVER include Entry IDs, GUIDs, or UUIDs in your answer text - they look ugly\n` +
        `- Just mention dates and brief descriptions naturally\n` +
        `- Keep your response clean and readable - use short paragraphs\n` +
        `- For lists, use simple numbered lists with dates and brief descriptions\n\n` +
        `In the referencedEntries array, include the IDs of entries you mention so they can be linked.\n\n` +
        `AVAILABLE ENTRIES:\n${JSON.stringify(availableEntries, null, 2)}\n\n` +
        `JOURNAL ENTRIES:\n${context}`
    ),
    ...history.map((msg) =>
      msg.role === 'human'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    ),
    new HumanMessage(question),
  ];

  const res = await structuredLlm.invoke(messages);
  return res as QAResponse;
};
