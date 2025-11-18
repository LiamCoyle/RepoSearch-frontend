"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { Contributor } from "@/types/github";

interface ContributorsListProps {
  owner: string;
  repo: string;
}

const ITEMS_PER_PAGE = 100;

export function ContributorsList({ owner, repo }: ContributorsListProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchContributors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getRepositoryContributors(owner, repo);
        setContributors(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load contributors");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, [owner, repo]);

  // Calculate pagination
  const totalPages = Math.ceil(contributors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedContributors = useMemo(() => {
    return contributors.slice(startIndex, endIndex);
  }, [contributors, startIndex, endIndex]);

  // Reset to page 1 when contributors change
  useEffect(() => {
    setCurrentPage(1);
  }, [contributors.length]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      <Card className="bg-background h-full">
        <CardHeader>
          <CardTitle>Contributors {!isLoading && `(${contributors.length})`}</CardTitle>
          <CardDescription>
            List of users who have contributed to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-muted-foreground text-center py-8">{error}</p>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {contributors.length === 0 ? (
                  <p className="text-muted-foreground">No contributors found</p>
                ) : (
                  paginatedContributors.map((contributor, index) => (
                    <div
                      key={contributor.id || `anonymous-${startIndex + index}`}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                    >
                      {contributor.avatar_url ? (
                        <Image
                          src={contributor.avatar_url}
                          alt={contributor.login || contributor.name || 'Anonymous'}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">
                          {contributor.login || contributor.name || 'Unknown'}
                        </span>
                        <p className="text-sm text-muted-foreground truncate">
                          {contributor.contributions} {contributor.contributions === 1 ? 'contribution' : 'contributions'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Pagination Controls */}
              {contributors.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Page</span>
                    <span className="font-medium text-foreground">{currentPage}</span>
                    <span>of</span>
                    <span className="font-medium text-foreground">{totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

