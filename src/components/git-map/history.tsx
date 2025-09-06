"use client";

import { History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistoryProps {
  repoHistory: string[];
  onSelectRepo: (url: string) => void;
  onClearHistory: () => void;
}

export function RepoHistory({ repoHistory, onSelectRepo, onClearHistory }: HistoryProps) {
  if (repoHistory.length === 0) {
    return (
        <div className="text-center text-sm text-sidebar-foreground/70">
            No history yet.
        </div>
    );
  }

  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between">
         <h3 className="text-sm font-semibold text-sidebar-foreground/90 flex items-center gap-2">
           <History className="h-4 w-4" />
           History
         </h3>
         <Button variant="ghost" size="icon" onClick={onClearHistory} aria-label="Clear history" className="h-7 w-7 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
           <Trash2 className="h-4 w-4" />
         </Button>
       </div>
        <div className="flex flex-col gap-1 text-sm">
          {repoHistory.map((repo, index) => (
            <button
              key={index}
              onClick={() => onSelectRepo(repo)}
              className="text-left text-sidebar-foreground/90 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-md p-2 truncate text-xs"
              title={repo}
            >
              {repo.replace('https://github.com/', '')}
            </button>
          ))}
        </div>
    </div>
  );
}