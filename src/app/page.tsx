"use client";

import { useState, useMemo } from 'react';
import { GitBranch, GitCommit, Github, Loader } from 'lucide-react';
import type { RepoData, Commit, Branch } from '@/lib/types';
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
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const { toast } = useToast();

  const mainBranchName = useMemo(() => {
    return repoData?.branches.find(b => b.name === 'main' || b.name === 'master')?.name || 'main';
  }, [repoData]);

  const handleFetchRepo = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedCommit(null);
    try {
      const data = await fetchRepoData(url);
      setRepoData(data);
      setSelectedBranch('all');
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
  
  const handleFilterChange = (branch: string) => {
    setSelectedBranch(branch);
  };

  const filteredRepoData = useMemo(() => {
    if (!repoData) return null;

    if (selectedBranch === 'all') {
      return repoData;
    }

    const visibleBranchesSet = new Set([mainBranchName, selectedBranch]);

    const commitsToShow = new Set<string>();
    const branchesToShow = new Set<string>();

    repoData.commits.forEach(commit => {
        if (visibleBranchesSet.has(commit.branch)) {
            commitsToShow.add(commit.sha);
            branchesToShow.add(commit.branch);
            
            let current = commit;
            while (current.parents.length > 0) {
                const parent = repoData.commits.find(c => c.sha === current.parents[0]);
                if (parent) {
                    commitsToShow.add(parent.sha);
                    branchesToShow.add(parent.branch);
                    current = parent;
                } else {
                    break;
                }
            }
        }
    });
    
    const filteredCommits = repoData.commits.filter(c => commitsToShow.has(c.sha));
    const filteredBranches = repoData.branches.filter(b => branchesToShow.has(b.name));

    return {
        ...repoData,
        commits: filteredCommits,
        branches: filteredBranches,
    };
  }, [repoData, selectedBranch, mainBranchName]);

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
                    allBranches={repoData.branches.filter(b => b.name !== mainBranchName)}
                    selectedBranch={selectedBranch}
                    onFilterChange={handleFilterChange}
                    mainBranchName={mainBranchName}
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
