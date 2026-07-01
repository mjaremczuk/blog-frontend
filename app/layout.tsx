import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minimalistyczny Blog Osobisty",
  description: "Czysty, nowoczesny blog osobisty stworzony przy użyciu Next.js i Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-85 transition-opacity">
                  Blog<span className="text-accent">Osobisty</span>
                </Link>
              </div>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Strona Główna
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  O mnie
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-grow mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Blog Osobisty. Wszystkie prawa zastrzeżone.
            </p>
            <p className="text-xs text-muted-foreground flex gap-4">
              <span>Zbudowano przy użyciu Next.js & Tailwind</span>
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
