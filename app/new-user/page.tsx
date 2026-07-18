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
  return (
    <div className='paper-bg flex min-h-screen flex-col items-center justify-center gap-4'>
      <div className='size-5 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-foreground/70' />
      <p className='font-serif text-lg text-muted-foreground'>
        Preparing your journal…
      </p>
    </div>
  );
};

export default NewUser;
