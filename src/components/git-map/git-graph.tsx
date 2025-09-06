"use client";

import React, { useMemo } from 'react';
import { CommitNode } from './commit-node';
import type { Commit, RepoData, BranchColorMap } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface GitGraphProps {
  repoData: RepoData;
  onCommitSelect: (commit: Commit) => void;
}

const X_SPACING = 80;
const Y_SPACING = 70;

const branchColors = [
  'hsl(231, 48%, 60%)',
  'hsl(174, 100%, 39%)',
  'hsl(340, 82%, 62%)',
  'hsl(39, 90%, 65%)',
  'hsl(270, 60%, 70%)',
  'hsl(190, 70%, 55%)',
];

export function GitGraph({ repoData, onCommitSelect }: GitGraphProps) {
  const { nodes, edges, branchColorMap, graphHeight, graphWidth } = useMemo(() => {
    if (!repoData || repoData.commits.length === 0) {
      return { nodes: [], edges: [], branchColorMap: {}, graphHeight: 0, graphWidth: 0 };
    }

    const colorMap: BranchColorMap = {};
    const allBranchesSorted = [...repoData.branches].sort((a,b) => a.name === 'main' ? -1 : b.name === 'main' ? 1 : a.name.localeCompare(b.name));
    allBranchesSorted.forEach((branch, index) => {
      colorMap[branch.name] = branchColors[index % branchColors.length];
    });

    const commitsBySha: { [sha: string]: Commit } = {};
    repoData.commits.forEach(commit => {
      commitsBySha[commit.sha] = commit;
    });

    const sortedCommits = [...repoData.commits].sort((a, b) => new Date(b.author.date).getTime() - new Date(a.author.date).getTime());

    const branchLanes: { [key: string]: number } = {};
    let maxLane = 0;
    allBranchesSorted.forEach(b => {
      if (branchLanes[b.name] === undefined) {
        branchLanes[b.name] = maxLane++;
      }
    });

    const positions: { [sha: string]: { x: number; y: number } } = {};
    sortedCommits.forEach((commit, index) => {
      const lane = branchLanes[commit.branch] ?? 0;
      positions[commit.sha] = {
        x: lane * X_SPACING + X_SPACING / 2,
        y: index * Y_SPACING + Y_SPACING / 2,
      };
    });
    
    const renderedNodes = sortedCommits.map(commit => ({
      ...commit,
      pos: positions[commit.sha],
    }));

    const renderedEdges = renderedNodes.flatMap(commit => {
      return commit.parents
        .filter(parentSha => positions[parentSha]) // Only draw edges to visible commits
        .map(parentSha => {
          const from = positions[commit.sha];
          const to = positions[parentSha];
          const color = colorMap[commit.branch] || '#ccc';

          return {
            id: `${commit.sha}-${parentSha}`,
            d: `M ${from.x} ${from.y} C ${from.x} ${from.y + Y_SPACING/2.5}, ${to.x} ${to.y - Y_SPACING/2.5}, ${to.x} ${to.y}`,
            color,
          };
        });
    });

    const height = sortedCommits.length * Y_SPACING;
    const width = Object.keys(branchLanes).length * X_SPACING;

    return { nodes: renderedNodes, edges: renderedEdges, branchColorMap: colorMap, graphHeight: height, graphWidth: width };
  }, [repoData]);

  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-center text-muted-foreground">No commits to display for the selected branches.</div>;
  }

  return (
    <ScrollArea className="w-full h-full">
      <div className="relative p-4" style={{ height: graphHeight, minWidth: graphWidth }}>
        <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
          <defs>
            {Object.entries(branchColorMap).map(([name, color]) => (
              <linearGradient key={name} id={`grad-${name.replace(/[^a-zA-Z0-9]/g, '-')}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0" />
                <stop offset="100%" stopColor={color} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>
          {edges.map(edge => (
            <path
              key={edge.id}
              d={edge.d}
              fill="none"
              stroke={edge.color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        {nodes.map(commit => (
          <CommitNode
            key={commit.sha}
            commit={commit}
            position={commit.pos}
            color={branchColorMap[commit.branch] || '#ccc'}
            onSelect={onCommitSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
