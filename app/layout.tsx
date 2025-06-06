import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { Toaster } from "sonner";
import { Navigation } from "@/components/navigation/navigation";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Create professional resumes easily",
  manifest: "/manifest.json",
  generator: "v0.dev",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /> */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> */}
        {/* <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /> */}
      </head>
      <body className={inter.className}>
        <LocaleProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1 container mx-auto py-6 px-4 md:px-6 pb-20 md:pb-10">
                {children}
              </main>
              <MobileNavigation />
              <Toaster richColors position="top-right" />
            </div>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
