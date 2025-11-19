"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  // Avoid hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setCurrentPage(page);

    try {
      const response = await api.searchRepositories(searchQuery, perPage, page);
      setRepositories(response.items || []);
      setTotalCount(response.total_count || 0);
      
      if (response.items && response.items.length > 0) {
        if (page === 1) {
          toast.success(`Found ${response.total_count?.toLocaleString() || 0} repositor${response.total_count === 1 ? 'y' : 'ies'}`);
        }
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
      setTotalCount(0);
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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background font-sans overflow-hidden">
      <main className="flex w-full max-w-4xl mx-auto flex-col h-full px-4 overflow-hidden">
        {/* Header Section - Fixed at top */}
        <div className="flex-shrink-0 pt-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex w-full flex-col items-center gap-3 mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
              Search GitHub Repositories
            </h1>
            
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
                placeholder="Eg. react, nextjs, tailwindcss, typescript,..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 pr-10"
                disabled={isLoading}
              />
              {isLoading ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setSearchQuery("");
                    setRepositories([]);
                    setCurrentPage(1);
                    setTotalCount(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-accent transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
            </div>
            <Button onClick={() => handleSearch(1)} className="flex-shrink-0 cursor-pointer" disabled={isLoading}>
              Search
            </Button>
          </motion.div>
        </div>

        {/* Scrollable Repository Section */}
        <div className="flex-1 min-h-0 mb-8">
          <div className="w-full px-4 h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Card className="bg-background h-full flex flex-col py-0">
              <CardContent className="pt-6 flex-1 overflow-y-auto custom-scrollbar pb-8 flex flex-col min-h-0 mx-4 my-4">
                <AnimatePresence mode="wait">
                    {isLoading && (
                      <motion.div
                        key="loader"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center gap-4 h-full min-h-[400px]"
                      >
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Searching repositories...</p>
                    </motion.div>
                  )}
                  {!isLoading && repositories.length > 0 && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-muted-foreground"
                      >
                        {totalCount > 0 && (
                          <>
                            Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalCount)} of {totalCount.toLocaleString()} {totalCount === 1 ? 'repository' : 'repositories'}
                          </>
                        )}
                      </motion.p>
                      <div className="space-y-4">
                        {repositories.map((repo, index) => (
                          <motion.div
                            key={repo.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card className="bg-background hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
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
                      
                      {/* Pagination Controls */}
                      {totalCount > perPage && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center justify-center gap-4 mt-8"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearch(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="flex items-center gap-2"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Page</span>
                            <span className="font-medium text-foreground">{currentPage}</span>
                            <span>of</span>
                            <span className="font-medium text-foreground">{Math.ceil(totalCount / perPage)}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearch(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(totalCount / perPage) || isLoading}
                            className="flex items-center gap-2"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                  {!isLoading && repositories.length === 0 && (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex flex-col items-center justify-center gap-6 h-full min-h-[400px]"
                    >
                      <motion.div 
                        className="relative"
                        whileHover="hover"
                        initial="default"
                      >
                        <div className="absolute inset-0 rounded-full bg-primary/10 blur-lg"></div>
                        <div className="relative rounded-full bg-muted/50 border border-border/50 p-6 backdrop-blur-sm w-20 h-20 flex items-center justify-center">
                          <motion.div
                            variants={{
                              default: { opacity: 1 },
                              hover: { opacity: 0 }
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Search className="h-8 w-8 text-muted-foreground" />
                          </motion.div>
                          <motion.div
                            variants={{
                              default: { opacity: 0 },
                              hover: { opacity: 1 }
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            {mounted && (
                              <Image
                                src={theme === "dark" ? "/github-mark-white.svg" : "/github-mark.svg"}
                                alt="GitHub"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                                unoptimized
                              />
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                      <div className="text-center space-y-4">
                        <p className="text-base text-muted-foreground leading-relaxed">
                          Enter a search query above to find repositories on GitHub.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
