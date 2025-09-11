import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

export const getUserByClerkID = async () => {
  const clerk = await currentUser();
  if (!clerk) throw new Error('Not authenticated');

  let user = await prisma.user.findUnique({ where: { clerkId: clerk.id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerk.id,
        email: clerk.emailAddresses?.[0]?.emailAddress || '',
      },
    });
  }
  return user;
};
