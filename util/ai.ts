import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { loadQARefineChain } from 'langchain/chains';
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
    .describe(
      'The main topic or subject of the journal entry in a few words.'
    ),
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

export const qa = async (
  question: string,
  entries: Array<{ id: string; content: string; createdAt: Date | string }>
) => {
  const docs = entries.map(
    (entry) =>
      new Document({
        pageContent: entry.content,
        metadata: { source: entry.id, date: entry.createdAt },
      })
  );

  const llm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 });
  const embeddings = new OpenAIEmbeddings();
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const relevantDocs = await store.similaritySearch(question);

  const chain = loadQARefineChain(llm);
  const res = await chain.call({
    input_documents: relevantDocs,
    question,
  });

  return res.output_text as string;
};
