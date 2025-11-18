"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import type { Repository } from "@/types/github";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Health check on initial load
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.healthCheck();
      } catch (err) {
        // Silently fail health check - don't show error to user on initial load
        console.error("Health check failed:", err);
      }
    };

    checkHealth();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.searchRepositories(searchQuery);
      setRepositories(response.items || []);
      
      if (response.items && response.items.length > 0) {
        toast.success(`Found ${response.items.length} repositor${response.items.length === 1 ? 'y' : 'ies'}`);
      } else {
        toast.info("No repositories found");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      setRepositories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      <main className="flex w-full max-w-4xl mx-auto flex-col h-full px-4 overflow-hidden">
        {/* Header Section - Fixed at top */}
        <div className="flex-shrink-0 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex w-full flex-col items-center gap-3 mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
              Discover GitHub Repositories
            </h1>
            <p className="text-center text-muted-foreground max-w-lg">
              Search and explore millions of open source projects
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full flex-row gap-4 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 pr-10"
                disabled={isLoading}
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setSearchQuery("");
                    setRepositories([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-accent transition-colors"
                  disabled={isLoading}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
            </div>
            <Button onClick={handleSearch} className="flex-shrink-0 cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </motion.div>
        </div>

        {/* Scrollable Repository Section */}
        <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar min-h-0 mb-4">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center gap-4 py-12 h-full"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching repositories...</p>
              </motion.div>
            )}
            {!isLoading && repositories.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full space-y-4 px-4"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground px-2"
                >
                  {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'} found
                </motion.p>
                <div className="space-y-4 px-2">
                  {repositories.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                        <Link href={`/repository/${repo.id}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {repo.full_name}
                            </CardTitle>
                            {repo.description && (
                              <CardDescription className="line-clamp-2 mt-2">
                                {repo.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {repo.language && (
                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                  <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-muted-foreground flex items-center gap-1">
                                <span className="text-base">⭐</span>
                                <span className="font-medium">{repo.stargazers_count.toLocaleString()}</span>
                              </span>
                              <span className="text-muted-foreground flex items-center gap-1">
                                <span className="text-base">🍴</span>
                                <span className="font-medium">{repo.forks_count.toLocaleString()}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Updated {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {!isLoading && repositories.length === 0 && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center gap-6 py-16 px-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl"></div>
                  <div className="relative rounded-full bg-muted/50 border border-border/50 p-6 backdrop-blur-sm">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-center space-y-3 max-w-md">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Search for GitHub repositories
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Enter a search query above to find repositories on GitHub.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
