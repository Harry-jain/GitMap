"use client";

import type { Commit } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useId } from 'react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface CommitNodeProps {
  commit: Commit;
  position: { x: number; y: number };
  color: string;
  onSelect: (commit: Commit) => void;
  xSpacing: number;
}

export function CommitNode({ commit, position, color, onSelect, xSpacing }: CommitNodeProps) {
  const id = useId();
  const isMerge = commit.parents.length > 1;
  const commitTitle = (commit.message || 'No commit message').split('\n')[0];
  const committerName = commit.author?.name || 'Unknown';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <g 
          className="group/commit-node"
          onClick={() => onSelect(commit)}
        >
          <TooltipTrigger asChild>
            <foreignObject
                x={position.x - 10}
                y={position.y - 10}
                width={20}
                height={20}
                className="overflow-visible cursor-pointer"
            >
              <div
                className="absolute rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-transform duration-300 ease-in-out group-hover/commit-node:scale-125"
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
              </div>
            </foreignObject>
          </TooltipTrigger>
           <TooltipTrigger asChild>
            <foreignObject
              x={position.x + 20}
              y={position.y - 12}
              width={xSpacing - 30}
              height={24}
              className="overflow-visible cursor-pointer"
            >
                <div 
                  className={cn(
                    "text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis p-1 rounded-md origin-left",
                    "transition-all duration-300 ease-in-out group-hover/commit-node:font-bold group-hover/commit-node:scale-110"
                  )}
                  style={{ width: 'max-content' }}
                  title={`${commitTitle} by ${committerName}`}
                >
                  <span className='font-medium'>{committerName}</span>: {commitTitle}
                </div>
            </foreignObject>
          </TooltipTrigger>
        </g>
        <TooltipContent className="p-4 rounded-lg shadow-xl max-w-sm w-full" side="right" align="start" sideOffset={15}>
          <div className="space-y-3">
            <h4 id={`commit-msg-${id}`} className="font-semibold text-base">{commitTitle}</h4>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {commit.author?.avatarUrl && <AvatarImage src={commit.author.avatarUrl} alt={commit.author.name || 'author'} data-ai-hint="person" />}
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{committerName}</p>
                {commit.author?.date ? (
                  <p className="text-xs text-muted-foreground">{format(parseISO(commit.author.date), "PPP p")}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">No date</p>
                )}
              </div>
            </div>
            <ScrollArea className="h-32 w-full">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap font-code pr-4">
                {commit.message || 'No commit message'}
              </p>
            </ScrollArea>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
