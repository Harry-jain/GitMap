"use client";

import { Branch } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

interface FiltersProps {
  allBranches: Branch[];
  visibleBranches: string[];
  onFilterChange: (branches: string[]) => void;
}

export function Filters({ allBranches, visibleBranches, onFilterChange }: FiltersProps) {
  const handleCheckedChange = (branchName: string, isChecked: boolean) => {
    if (isChecked) {
      onFilterChange([...visibleBranches, branchName]);
    } else {
      onFilterChange(visibleBranches.filter(b => b !== branchName));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <ListFilter className="mr-2 h-4 w-4" />
            Branches
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Branch</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allBranches.map(branch => (
            <DropdownMenuCheckboxItem
              key={branch.name}
              checked={visibleBranches.includes(branch.name)}
              onCheckedChange={(checked) => handleCheckedChange(branch.name, !!checked)}
            >
              {branch.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-sm text-muted-foreground">
        Showing {visibleBranches.length} of {allBranches.length} branches.
      </p>
    </div>
  );
}
