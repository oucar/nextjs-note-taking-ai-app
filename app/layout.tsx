import './globals.css';
import { Fraunces, Karla } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
  variable: '--font-fraunces',
});

const karla = Karla({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-karla',
});

export const metadata = {
  title: 'Mood — a journal that listens',
  description:
    'A quiet, AI-powered journal that tracks how you feel and helps you notice patterns.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang='en'
        suppressHydrationWarning
        className={`${fraunces.variable} ${karla.variable}`}
      >
        <body className='font-sans'>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
