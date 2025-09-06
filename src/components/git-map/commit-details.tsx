"use client";

import { useState, useEffect } from 'react';
import { GitCommit, User, Calendar, BrainCircuit, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getCommitSummary } from '@/lib/actions';
import type { Commit } from '@/lib/types';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CommitDetailsProps {
  commit: Commit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommitDetails({ commit, isOpen, onClose }: CommitDetailsProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (commit) {
      setSummary(null);
      setIsSummaryLoading(false);
    }
  }, [commit]);

  const handleGenerateSummary = async () => {
    if (!commit) return;
    setIsSummaryLoading(true);
    try {
      const result = await getCommitSummary(commit);
      setSummary(result);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "AI Summary Failed",
        description: "Could not generate a summary for this commit. Please try again later.",
      });
      setSummary("Summary generation failed.");
    }
    setIsSummaryLoading(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col" side="right">
        {commit ? (
          <>
            <SheetHeader className="p-6 pb-2">
              <SheetTitle className="flex items-center gap-2">
                <GitCommit className="h-5 w-5 text-primary" />
                Commit Details
              </SheetTitle>
              <SheetDescription className="break-all !mt-1 font-mono text-xs">
                {commit.sha}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Message</h3>
                  <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap font-code">{commit.message}</div>
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Author:</span>
                    <span>{commit.author.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{format(new Date(commit.author.date), "PPP p")}</span>
                  </div>
                   <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Branch:</span>
                    <Badge variant="secondary">{commit.branch}</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    AI Summary
                  </h3>
                  {isSummaryLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : summary ? (
                    <div className="text-sm bg-muted p-3 rounded-md">{summary}</div>
                  ) : (
                    <div className="text-center border rounded-lg p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Get a quick summary of this commit's changes.</p>
                       <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
                         Generate AI Summary
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a commit to see details</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
