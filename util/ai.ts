import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { loadQARefineChain } from 'langchain/chains';
import z from 'zod';

const analysisSchema = z.object({
  mood: z
    .string()
    .describe('the mood of the person who wrote the journal entry.'),
  subject: z.string().describe('the subject of the journal entry.'),
  negative: z.boolean().describe('does it contain negative emotions?'),
  summary: z.string().describe('quick summary of the entire entry.'),
  color: z.string().describe('hex color like #0101fe representing the mood.'),
  sentimentScore: z
    .number()
    .describe('from -10 (very negative) to 10 (very positive).'),
});

const getPrompt = async (content: string) => {
  const prompt = new PromptTemplate({
    template:
      'Analyze the following journal entry and return the requested fields.\n\nENTRY:\n{entry}',
    inputVariables: ['entry'],
  });
  return prompt.format({ entry: content });
};

export const analyzeEntry = async (entry: { content: string }) => {
  const input = await getPrompt(entry.content);

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini', // or another current chat model
    temperature: 0,
  });

  // This guarantees JSON that matches your Zod schema (with retries under the hood)
  const structured = model.withStructuredOutput(analysisSchema);
  return structured.invoke(input);
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
