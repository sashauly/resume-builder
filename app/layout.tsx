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

const APP_NAME = 'Resume Builder';
const APP_DEFAULT_TITLE = 'Resume Builder';
const APP_TITLE_TEMPLATE = '%s - Resbu';
const APP_DESCRIPTION = 'Create professional resumes easily';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
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
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        <link rel='apple-touch-icon' href='icons/apple-touch-icon-180x180.png' sizes='180x180' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
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
              <main className='container mx-auto flex-1 px-4 py-6 pb-20 md:px-6 md:pb-10 lg:max-w-7xl'>
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
