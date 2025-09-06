"use client";

import { Branch } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface FiltersProps {
  allBranches: Branch[];
  selectedBranch: string;
  onFilterChange: (branch: string) => void;
  mainBranchName: string;
  branchPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalBranches: number;
}

export function Filters({ 
  allBranches, 
  selectedBranch, 
  onFilterChange, 
  mainBranchName,
  branchPage,
  onPageChange,
  pageSize,
  totalBranches,
}: FiltersProps) {
  const totalPages = Math.ceil(totalBranches / pageSize);
  
  const numVisibleBranches = selectedBranch === 'all'
    ? Math.min(pageSize, totalBranches - (branchPage - 1) * pageSize)
    : 1;

  const getShowingText = () => {
    if (selectedBranch === 'all') {
      const start = (branchPage - 1) * pageSize + 1;
      const end = start + numVisibleBranches -1;
      return `Showing branches ${start}-${end} of ${totalBranches} (plus ${mainBranchName})`;
    }
    return `Showing branches: ${mainBranchName}, ${selectedBranch}.`;
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <ListFilter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by branch:</span>
      </div>
      <Select value={selectedBranch} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches (Paginated)</SelectItem>
          {allBranches.map(branch => (
            <SelectItem key={branch.name} value={branch.name}>
              {mainBranchName} + {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedBranch === 'all' && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onPageChange(branchPage - 1)} 
            disabled={branchPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {branchPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onPageChange(branchPage + 1)}
            disabled={branchPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground flex-1 text-right">
        {getShowingText()}
      </p>
    </div>
  );
}
