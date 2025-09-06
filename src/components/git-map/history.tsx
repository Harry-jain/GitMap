"use client";

import { History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoryProps {
  repoHistory: string[];
  onSelectRepo: (url: string) => void;
  onClearHistory: () => void;
}

export function RepoHistory({ repoHistory, onSelectRepo, onClearHistory }: HistoryProps) {
  if (repoHistory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          History
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClearHistory} aria-label="Clear history">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          {repoHistory.map((repo, index) => (
            <button
              key={index}
              onClick={() => onSelectRepo(repo)}
              className="text-left text-primary hover:underline truncate"
            >
              {repo}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
