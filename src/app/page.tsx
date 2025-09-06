"use client";

import { useState } from 'react';
import { GitBranch, GitCommit, Github, Loader } from 'lucide-react';
import type { RepoData, Commit } from '@/lib/types';
import { fetchRepoData } from '@/lib/mock-data';
import { RepoForm } from '@/components/git-map/repo-form';
import { GitGraph } from '@/components/git-map/git-graph';
import { CommitDetails } from '@/components/git-map/commit-details';
import { Filters } from '@/components/git-map/filters';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [visibleBranches, setVisibleBranches] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFetchRepo = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedCommit(null);
    try {
      const data = await fetchRepoData(url);
      setRepoData(data);
      setVisibleBranches(data.branches.map(b => b.name));
    } catch (err) {
      const errorMessage = 'Failed to fetch repository data. Please check the URL and try again.';
      setError(errorMessage);
      setRepoData(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitSelect = (commit: Commit) => {
    setSelectedCommit(commit);
  };
  
  const handleFilterChange = (branches: string[]) => {
    setVisibleBranches(branches);
  };

  const filteredRepoData = repoData && visibleBranches.length > 0 ? {
    ...repoData,
    commits: repoData.commits.filter(c => {
      const branchOfCommit = c.branch;
      return visibleBranches.includes(branchOfCommit) || c.parents.some(pSha => {
        const parentCommit = repoData.commits.find(pc => pc.sha === pSha);
        return parentCommit && visibleBranches.includes(parentCommit.branch) && parentCommit.branch !== branchOfCommit;
      });
    }),
    branches: repoData.branches.filter(b => visibleBranches.includes(b.name)),
  } : repoData ? { ...repoData, commits: [], branches: [] } : null;

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <GitBranch className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold font-headline">GitMap</h1>
          </div>
          <div className="flex-1 max-w-2xl">
            <RepoForm onSubmit={handleFetchRepo} isLoading={isLoading} />
          </div>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/firebase/studio" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-auto p-4 md:p-6">
            {isLoading && (
              <div className="flex flex-1 items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && !repoData && !error && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <GitCommit className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 text-2xl font-semibold">Visualize a Repository</h2>
                  <p className="mt-2 text-muted-foreground">
                    Enter a GitHub repository URL above to see its branch structure.
                  </p>
                </div>
              </div>
            )}
            {repoData && !isLoading && (
              <>
                <div className="mb-4 shrink-0">
                  <Filters 
                    allBranches={repoData.branches}
                    visibleBranches={visibleBranches}
                    onFilterChange={handleFilterChange}
                  />
                </div>
                <div className="flex-1 relative min-h-0 flex items-center justify-center">
                  <GitGraph 
                    repoData={filteredRepoData ?? { commits: [], branches: [] }}
                    onCommitSelect={handleCommitSelect} 
                  />
                </div>
              </>
            )}
          </div>

          <CommitDetails
            commit={selectedCommit}
            isOpen={!!selectedCommit}
            onClose={() => setSelectedCommit(null)}
          />
        </div>
      </main>
    </div>
  );
}