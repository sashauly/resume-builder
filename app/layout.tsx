import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { LocaleProvider } from '@/components/locale/locale-provider';
import { Toaster } from 'sonner';
import { Navigation } from '@/components/navigation/navigation';
import { MobileNavigation } from '@/components/navigation/mobile-navigation';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Resume Builder',
  description: 'Create professional resumes easily',
  manifest: '/manifest.json',
  icons: [
    './icons/icon-48x48.png',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-256x256.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta name='apple-mobile-web-app-title' content='Resbu' />
        <link rel='icon' href='/favicon.ico' sizes='48x48' />
        <link
          rel='apple-touch-icon'
          href='icons/apple-touch-icon-180x180.png'
          sizes='180x180'
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <LocaleProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <div className='flex min-h-screen flex-col'>
              <Navigation />
              <main className='container mx-auto flex-1 px-4 py-6 pb-20 md:px-6 md:pb-10'>
                {children}
              </main>
              <MobileNavigation />
              <Toaster richColors position='top-right' />
            </div>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
