import { prisma } from '@/util/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const createNewUser = async () => {
  const user = await currentUser();
  if (!user) {
    // If there's no Clerk user (shouldn't happen on this route), send back to home.
    redirect('/');
  }

  const match = await prisma.user.findUnique({
    where: {
      clerkId: user.id as string,
    },
  });

  if (!match) {
    const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

    await prisma.user.upsert({
      where: { email },
      update: { clerkId: user.id },
      create: { clerkId: user.id, email },
    });
  }

  redirect('/journal');
};

const NewUser = async () => {
  await createNewUser();
  return <div>...loading</div>;
};

export default NewUser;
