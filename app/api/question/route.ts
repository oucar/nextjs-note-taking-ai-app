import { qa } from '@/util/ai';
import { getUserFromClerkID } from '@/util/auth';
import { prisma } from '@/util/db';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  const { question, history = [] } = await request.json();
  const user = await getUserFromClerkID();
  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      analysis: {
        select: {
          mood: true,
          subject: true,
          summary: true,
          negative: true,
          sentimentScore: true,
        },
      },
    },
  });

  const answer = await qa(question, entries, history);
  return NextResponse.json({ data: answer });
};
