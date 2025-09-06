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

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect(commit)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            style={{ left: position.x, top: position.y, width: '24px', height: '24px' }}
            aria-labelledby={`commit-msg-${id}`}
          >
            <div 
              className="w-6 h-6 rounded-full border-2 border-background bg-clip-padding p-0.5 transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
            >
              <div className="w-full h-full rounded-full bg-background/30"></div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p id={`commit-msg-${id}`} className="max-w-xs font-code">{commit.message.split('\n')[0]}</p>
          <p className="text-xs text-muted-foreground">{commit.author.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
