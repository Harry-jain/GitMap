"use client";

import type { Commit } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useId } from 'react';

interface CommitNodeProps {
  commit: Commit;
  position: { x: number; y: number };
  color: string;
  onSelect: (commit: Commit) => void;
}

export function CommitNode({ commit, position, color, onSelect }: CommitNodeProps) {
  const id = useId();
  const isMerge = commit.parents.length > 1;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect(commit)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-transform hover:scale-110"
            style={{ left: position.x, top: position.y, width: '20px', height: '20px' }}
            aria-labelledby={`commit-msg-${id}`}
          >
            <div 
              className={`w-5 h-5 border-2 bg-clip-padding p-0.5 ${isMerge ? 'rounded-md' : 'rounded-full'}`}
              style={{ 
                backgroundColor: color, 
                borderColor: 'hsl(var(--background))',
              }}
            >
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p id={`commit-msg-${id}`} className="max-w-xs font-code font-semibold">{commit.message.split('\n')[0]}</p>
          <p className="text-xs text-muted-foreground">{commit.author.name} on {new Date(commit.author.date).toLocaleDateString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}