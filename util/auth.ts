// util/auth.ts
import 'server-only';

import { prisma } from './db';
import { auth } from '@clerk/nextjs/server';
// If you want a type for syncNewUser's arg, prefer @clerk/backend in v6:
import type { User } from '@clerk/backend';

export async function getUserFromClerkID(select = { id: true }) {
  const { userId } = await auth(); // ✅ must await in v6
  if (!userId) {
    throw new Error('Not authenticated');
  }

  // If you want to auto-create the user on first access, use findUnique + create.
  // If you *expect* it to exist already, keep OrThrow.
  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId: userId },
    select: select as any, // tighten types later if you want
  });

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
