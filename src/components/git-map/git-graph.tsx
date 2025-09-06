"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { CommitNode } from './commit-node';
import type { Commit, RepoData, BranchColorMap } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface GitGraphProps {
  repoData: RepoData;
  onCommitSelect: (commit: Commit) => void;
}

const X_SPACING = 200;
const Y_SPACING = 70;

const branchColors = [
  '#4c8bf5', // blue
  '#34a853', // green
  '#fbbc05', // yellow
  '#ea4335', // red
  '#9c27b0', // purple
  '#009688', // teal
];

export function GitGraph({ repoData, onCommitSelect }: GitGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(entries => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          setContainerDimensions({ width, height });
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);
  
  const { nodes, edges, branchColorMap, graphHeight, graphWidth } = useMemo(() => {
    if (!repoData || repoData.commits.length === 0) {
      return { nodes: [], edges: [], branchColorMap: {}, graphHeight: 0, graphWidth: 0 };
    }

    const colorMap: BranchColorMap = {};
    const mainBranchName = repoData.branches.find(b => b.name === 'main' || b.name === 'master')?.name || 'main';
    const allBranchesSorted = [...repoData.branches].sort((a,b) => a.name === mainBranchName ? -1 : b.name === mainBranchName ? 1 : a.name.localeCompare(b.name));
    
    allBranchesSorted.forEach((branch, index) => {
      colorMap[branch.name] = branchColors[index % branchColors.length];
    });

    const commitsBySha: { [sha: string]: Commit } = {};
    repoData.commits.forEach(commit => {
      commitsBySha[commit.sha] = commit;
    });

    const sortedCommits = [...repoData.commits].sort((a, b) => new Date(a.author.date).getTime() - new Date(b.author.date).getTime());

    const branchLanes: { [key: string]: number } = {};
    let maxLane = 0;
    
    // Assign main branch to lane 0 if it exists
    if (allBranchesSorted.some(b => b.name === mainBranchName)) {
        branchLanes[mainBranchName] = 0;
        maxLane = 1;
    }

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
        .filter(parentSha => positions[parentSha])
        .map(parentSha => {
          const from = positions[commit.sha];
          const to = positions[parentSha];
          const color = colorMap[commit.branch] || '#ccc';

          // Use a more pronounced curve, especially for merges
          const curve = Y_SPACING * 0.6;
          let d: string;
          if (from.x === to.x) {
            d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
          } else {
             d = `M ${from.x} ${from.y} C ${from.x} ${from.y - curve}, ${to.x} ${to.y + curve}, ${to.x} ${to.y}`;
          }

          return {
            id: `${commit.sha}-${parentSha}`,
            d,
            color,
          };
        });
    });

    const height = sortedCommits.length * Y_SPACING;
    const width = Object.keys(branchLanes).length * X_SPACING;

    return { nodes: renderedNodes, edges: renderedEdges, branchColorMap: colorMap, graphHeight: height, graphWidth: width };
  }, [repoData]);
  
  const offsetX = Math.max(0, (containerDimensions.width - graphWidth) / 2);

  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-center text-muted-foreground">No commits to display for the selected branches.</div>;
  }

  return (
    <ScrollArea className="w-full h-full" ref={containerRef}>
      <div className="relative p-4" style={{ height: graphHeight, width: Math.max(graphWidth, containerDimensions.width) }}>
        <div style={{ transform: `translateX(${offsetX}px)`}}>
          <svg width={graphWidth} height={graphHeight} className="absolute top-0 left-0 pointer-events-none">
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
      </div>
    </ScrollArea>
  );
}
