"use client";

import { useState, useMemo, useEffect } from 'react';
import { GitBranch, GitCommit, Github, Loader, PanelLeft } from 'lucide-react';
import type { RepoData, Commit, Branch } from '@/lib/types';
import { fetchRepoData } from '@/lib/actions';
import { RepoForm } from '@/components/git-map/repo-form';
import { GitGraph } from '@/components/git-map/git-graph';
import { CommitDetails } from '@/components/git-map/commit-details';
import { Filters } from '@/components/git-map/filters';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RepoHistory } from '@/components/git-map/history';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';

const MAX_HISTORY = 10;
const BRANCH_PAGE_SIZE = 10;

export default function Home() {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [branchPage, setBranchPage] = useState(1);
  const [repoHistory, setRepoHistory] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('gitmap_history');
      if (storedHistory) {
        setRepoHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e)
    }
  }, []);

  const updateHistory = (url: string) => {
    setRepoHistory(prevHistory => {
      const newHistory = [url, ...prevHistory.filter(item => item !== url)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem('gitmap_history', JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save history to localStorage", e)
      }
      return newHistory;
    });
  };

  const clearHistory = () => {
    setRepoHistory([]);
     try {
      localStorage.removeItem('gitmap_history');
    } catch (e) {
      console.error("Failed to remove history from localStorage", e)
    }
  };


  const mainBranchName = useMemo(() => {
    if (!repoData) return 'main';
    return repoData.branches.find(b => b.name === 'main' || b.name === 'master')?.name || 'main';
  }, [repoData]);

  const handleFetchRepo = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedCommit(null);
    try {
      const data = await fetchRepoData(url);
      setRepoData(data);
      setBranchFilter('all');
      setBranchPage(1);
      updateHistory(url);
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
    setBranchFilter(branch);
  };
  
  const handleBranchPageChange = (page: number) => {
    setBranchPage(page);
  };

  const filteredRepoData = useMemo(() => {
    if (!repoData) return null;

    const branchesToShow = new Set<string>([mainBranchName]);
    if (branchFilter === 'all') {
      const start = (branchPage - 1) * BRANCH_PAGE_SIZE;
      const end = start + BRANCH_PAGE_SIZE;
      repoData.branches
        .filter(b => b.name !== mainBranchName)
        .slice(start, end)
        .forEach(b => branchesToShow.add(b.name));
    } else {
      branchesToShow.add(branchFilter);
    }

    const commitsToShow = new Set<string>();
    let includedBranches = new Set<string>();

    repoData.commits.forEach(commit => {
        if (commit.branch && branchesToShow.has(commit.branch)) {
            let current: Commit | undefined = commit;
            while (current) {
                if (commitsToShow.has(current.sha)) break;
                commitsToShow.add(current.sha);
                if(current.branch) includedBranches.add(current.branch);
                
                if (current.parents.length > 0) {
                    current = repoData.commits.find(c => c.sha === current.parents[0]);
                } else {
                    current = undefined;
                }
            }
        }
    });

    if (branchesToShow.has(mainBranchName)) {
        repoData.commits.forEach(commit => {
            if (commit.branch === mainBranchName) {
                commitsToShow.add(commit.sha);
            }
        });
        includedBranches.add(mainBranchName);
    }
    
    const filteredCommits = repoData.commits.filter(c => commitsToShow.has(c.sha));
    const filteredBranches = repoData.branches.filter(b => includedBranches.has(b.name));


    return {
        ...repoData,
        commits: filteredCommits,
        branches: filteredBranches,
    };
  }, [repoData, branchFilter, branchPage, mainBranchName]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-0">
          <SidebarHeader className="p-4">
             <div className="flex items-center gap-3">
              <GitBranch className="h-6 w-6 text-sidebar-primary" />
              <h1 className="text-xl font-semibold font-headline text-sidebar-primary-foreground">GitMap</h1>
            </div>
          </SidebarHeader>
          <SidebarGroup className="p-4 pt-0">
             <RepoHistory
                repoHistory={repoHistory}
                onSelectRepo={handleFetchRepo}
                onClearHistory={clearHistory}
              />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/firebase/studio" target="_blank" rel="noopener noreferrer" className="text-sidebar-foreground hover:text-sidebar-accent-foreground">
                <Github className="h-5 w-5" />
              </a>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen w-full bg-background text-foreground flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1 max-w-2xl ml-4">
              <RepoForm onSubmit={handleFetchRepo} isLoading={isLoading} />
            </div>
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
                  <div className="text-center max-w-md">
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
                      selectedBranch={branchFilter}
                      onFilterChange={handleFilterChange}
                      mainBranchName={mainBranchName}
                      branchPage={branchPage}
                      onPageChange={handleBranchPageChange}
                      pageSize={BRANCH_PAGE_SIZE}
                      totalBranches={repoData.branches.length - 1}
                    />
                  </div>
                  <div className="flex-1 relative min-h-0 bg-muted/20 rounded-lg border">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}