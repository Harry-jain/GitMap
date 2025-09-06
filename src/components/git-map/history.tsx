"use client";

import { History, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HistoryItem } from '@/lib/history';

interface HistoryProps {
  repoHistory: HistoryItem[];
  onSelectRepo: (url: string) => void;
  onClearHistory: () => void;
  onRemoveFromHistory?: (url: string) => void;
  isAuthenticated?: boolean;
}

export function RepoHistory({ repoHistory, onSelectRepo, onClearHistory, onRemoveFromHistory, isAuthenticated = false }: HistoryProps) {
  if (repoHistory.length === 0) {
    return (
        <div className="text-center text-sm text-sidebar-foreground/70">
            {isAuthenticated ? (
              "No history yet."
            ) : (
              <div className="space-y-2">
                <div>No history yet.</div>
                <div className="text-xs text-sidebar-foreground/50">
                  Sign in to sync your history across devices
                </div>
              </div>
            )}
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
          {repoHistory.map((item) => (
            <div key={item.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelectRepo(item.repo_url)}
                className="flex-1 text-left text-sidebar-foreground/90 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-md p-2 truncate text-xs"
                title={item.repo_url}
              >
                {item.repo_name}
              </button>
              {onRemoveFromHistory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromHistory(item.repo_url);
                  }}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/50 hover:text-sidebar-accent-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
    </div>
  );
}