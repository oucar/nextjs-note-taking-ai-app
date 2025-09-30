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
    // Ensure we provide a non-null email if your schema requires it. If email
    // can be null in your Prisma schema, prefer 'email: null' instead.
    const email = user?.emailAddresses?.[0]?.emailAddress ?? '';

    await prisma.user.create({
      data: {
        clerkId: user.id,
        email,
      },
    });
  }

  redirect('/journal');
};

const NewUser = async () => {
  await createNewUser();
  return <div>...loading</div>;
};

export default NewUser;
