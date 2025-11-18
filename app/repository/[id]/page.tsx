"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { RepositoryDetails } from "@/types/github";
import { RepositoryHeader } from "@/components/repository/repository-header";
import { CommitTimeline } from "@/components/repository/commit-timeline";
import { ContributorsList } from "@/components/repository/contributors-list";
import { UserImpact } from "@/components/repository/user-impact";
import { LanguageDistribution } from "@/components/repository/language-distribution";

export default function RepositoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repositoryId = params.id as string;
  const repoId = useMemo(() => {
    const id = parseInt(repositoryId, 10);
    return isNaN(id) ? null : id;
  }, [repositoryId]);

  const [repository, setRepository] = useState<RepositoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);


  useEffect(() => {
    if (!repoId) {
      toast.error("Invalid repository ID");
      router.push("/");
      return;
    }


    const fetchRepositoryData = async () => {
      setIsLoading(true);
      try {
        const repoDetails = await api.getRepositoryById(repoId);
        setRepository(repoDetails);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setIsNotFound(true);
          } else {
            toast.error(err.message);
            router.push("/");
          }
        } else {
          toast.error("Failed to load repository data");
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositoryData();
    
  }, [repoId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading repository data...</p>
        </motion.div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Repository Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The repository you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!repository) {
    return null;
  }

  const [owner, repo] = repository.full_name.split("/");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-4rem)] bg-background font-sans overflow-y-auto"
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <RepositoryHeader repository={repository} />

        <CommitTimeline owner={owner} repo={repo} />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-3"
        >
          <ContributorsList owner={owner} repo={repo} />
          <UserImpact owner={owner} repo={repo} />
          <LanguageDistribution owner={owner} repo={repo} />
        </motion.div>
      </div>
    </motion.div>
  );
}

