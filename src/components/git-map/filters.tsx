"use client";

import { Branch } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListFilter } from 'lucide-react';

interface FiltersProps {
  allBranches: Branch[];
  selectedBranch: string;
  onFilterChange: (branch: string) => void;
  mainBranchName: string;
}

export function Filters({ allBranches, selectedBranch, onFilterChange, mainBranchName }: FiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ListFilter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by branch:</span>
      </div>
      <Select value={selectedBranch} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {allBranches.map(branch => (
            <SelectItem key={branch.name} value={branch.name}>
              {mainBranchName} + {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        {selectedBranch === 'all'
          ? `Showing all ${allBranches.length + 1} branches.`
          : `Showing branches: ${mainBranchName}, ${selectedBranch}.`
        }
      </p>
    </div>
  );
}
