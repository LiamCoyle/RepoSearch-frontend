import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { RepositoryDetails } from "@/types/github";

interface RepositoryHeaderProps {
  repository: RepositoryDetails;
}

export function RepositoryHeader({ repository }: RepositoryHeaderProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link href="/">
          <Button variant="outline" className="cursor-pointer">← Back to Search</Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-2">
          {repository.full_name}
        </h1>
        {repository.description && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
            {repository.description}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {repository.language && (
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-primary"></span>
              {repository.language}
            </span>
          )}
          <span>⭐ {repository.stargazers_count.toLocaleString()}</span>
          <span>🍴 {repository.forks_count.toLocaleString()}</span>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on GitHub →
          </a>
        </div>
      </motion.div>
    </>
  );
}

