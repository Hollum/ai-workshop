import { ActiveLink } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { GithubIcon } from "lucide-react";
import { Public_Sans } from "next/font/google";
import Image from "next/image";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
const publicSans = Public_Sans({ subsets: ["latin"] });

const Logo = () => <Image src="/images/bekk.png" alt="Bekk + JrC ❤️" width={70} height={100} />;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Bekk + JrC ❤️</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="Starter template showing how to use LangChain in Next.js projects."
        />
        <meta property="og:title" content="LangChain + Next.js Template" />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <NuqsAdapter>
          <div className="bg-secondary grid grid-rows-[auto,1fr] h-[100dvh]">
            <div className="grid grid-cols-[1fr,auto] gap-2 p-4">
              <div className="flex gap-4 flex-col md:flex-row md:items-center">
                <a
                  href="https://js.langchain.com"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <Logo />
                </a>
                <nav className="flex gap-1 flex-col md:flex-row">
                  <ActiveLink href="/">🤏 Oppgave 1</ActiveLink>
                  <ActiveLink href="/task2">🧱 Oppgave 2</ActiveLink>
                  <ActiveLink href="/task3">📂 Oppgave 3</ActiveLink>
                  <ActiveLink href="/task4">🤖 Oppgave 4</ActiveLink>
                  <ActiveLink href="/task5">🦾 Oppgave 5</ActiveLink>
                </nav>
              </div>

              <div className="flex justify-center">
                <Button asChild variant="outline" size="default">
                  <a href="https://github.com/Hollum/ai-workshop" target="_blank">
                    <GithubIcon className="size-3" />
                    <span>Åpne i GitHub</span>
                  </a>
                </Button>
              </div>
            </div>
            <div className="bg-background mx-4 relative grid rounded-t-2xl border border-input border-b-0">
              <div className="absolute inset-0">{children}</div>
            </div>
          </div>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}
