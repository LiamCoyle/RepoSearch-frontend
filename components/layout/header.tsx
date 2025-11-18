"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image
              src="/github-mark-white.svg"
              alt="GitHub"
              width={32}
              height={32}
              className="dark:opacity-100 opacity-0 absolute inset-0"
              unoptimized
            />
            <Image
              src="/github-mark.svg"
              alt="GitHub"
              width={32}
              height={32}
              className="dark:opacity-0 opacity-100 absolute inset-0"
              unoptimized
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            RepoSearch
          </h1>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

