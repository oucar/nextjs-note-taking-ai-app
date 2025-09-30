// util/auth.ts
import 'server-only';

import { prisma } from './db';
import type { Prisma } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
// If you want a type for syncNewUser's arg, prefer @clerk/backend in v6:
import type { User } from '@clerk/backend';

export async function getUserFromClerkID(
  select: Prisma.UserSelect = { id: true }
) {
  const { userId } = await auth(); // ✅ must await in v6
  if (!userId) {
    throw new Error('Not authenticated');
  }

  // If you want to auto-create the user on first access, use findUnique + create.
  // Using findUniqueOrThrow here will bubble up a PrismaClientKnownRequestError
  // which looks cryptic in server logs when the DB record simply doesn't exist.
  // Use findUnique and return a clearer error message so callers can decide
  // whether to create the user or surface a helpful message to the client.
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select,
  });

  if (!user) {
    // Provide a concise, actionable error instead of Prisma's generic "not found".
    throw new Error(
      `No local DB user found for Clerk id ${userId}. If this is a newly-signed-up user, run syncNewUser to create a DB user, or change this function to auto-create on first access.`
    );
  }

  return user;
}

// Creates a DB user if none exists yet (safe to call after Clerk user creation webhooks, etc.)
export async function syncNewUser(clerkUser: User) {
  const existing = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (existing) return existing;

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;

  const created = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      // If your Prisma schema allows null, keep as-is; otherwise ensure non-null.
      email,
      account: {
        create: {
          // stripeCustomerId: ...
          // stripeSubscriptionId: ...
        },
      },
    },
  });

  return created;
}
