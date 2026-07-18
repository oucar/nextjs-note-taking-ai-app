import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SigninPage() {
  return (
    <div className='paper-bg flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12'>
      <Link href='/' className='font-serif text-3xl font-medium tracking-tight'>
        Mood<span className='text-primary'>.</span>
      </Link>
      <div className='rise rise-1'>
        <SignIn signUpUrl='/sign-up' />
      </div>
    </div>
  );
}
