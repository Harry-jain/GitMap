"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { CommitNode } from './commit-node';
import type { Commit, RepoData, BranchColorMap } from '@/lib/types';

interface GitGraphProps {
  repoData: RepoData;
  onCommitSelect: (commit: Commit) => void;
}

const X_SPACING_BASE = 200;
const X_SPACING_MIN = 120;
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
  const { nodes, edges, branchColorMap, graphHeight, graphWidth, xSpacing } = useMemo(() => {
    if (!repoData || repoData.commits.length === 0) {
      return { nodes: [], edges: [], branchColorMap: {}, graphHeight: 0, graphWidth: 0, xSpacing: X_SPACING_BASE };
    }

    const colorMap: BranchColorMap = {};
    const mainBranchName = repoData.branches.find(b => b.name === 'main' || b.name === 'master')?.name || 'main';
    const allBranchesSorted = [...repoData.branches].sort((a,b) => a.name === mainBranchName ? -1 : b.name === mainBranchName ? 1 : a.name.localeCompare(b.name));
    
    allBranchesSorted.forEach((branch, index) => {
      colorMap[branch.name] = branchColors[index % branchColors.length];
    });

    const commitsBySha: { [sha: string]: Commit } = {};
    repoData.commits.forEach(commit => {
      if (commit.sha) {
        commitsBySha[commit.sha] = commit;
      }
    });

    const sortedCommits = [...repoData.commits].sort((a, b) => {
        const dateA = a.author?.date ? new Date(a.author.date).getTime() : 0;
        const dateB = b.author?.date ? new Date(b.author.date).getTime() : 0;
        if (dateA === dateB) {
            return 0;
        }
        return dateA - dateB;
    });

    const branchLanes: { [key: string]: number } = {};
    let leftLane = -1;
    let rightLane = 1;

    // Assign main branch to lane 0 if it exists
    if (allBranchesSorted.some(b => b.name === mainBranchName)) {
        branchLanes[mainBranchName] = 0;
    }

    allBranchesSorted.forEach((b, index) => {
        if (branchLanes[b.name] === undefined) {
            if ((index % 2) === 1) { // Distribute branches to left and right
                branchLanes[b.name] = rightLane++;
            } else {
                branchLanes[b.name] = leftLane--;
            }
        }
    });

    const minLane = Math.min(0, ...Object.values(branchLanes));

    const numLanes = Object.keys(branchLanes).length;
    const dynamicXSpacing = Math.max(X_SPACING_MIN, X_SPACING_BASE - (numLanes > 10 ? (numLanes - 10) * 10 : 0));

    const positions: { [sha: string]: { x: number; y: number } } = {};
    sortedCommits.forEach((commit, index) => {
      if (commit.sha) {
        const lane = branchLanes[commit.branch] ?? 0;
        positions[commit.sha] = {
          x: (lane - minLane) * dynamicXSpacing + dynamicXSpacing / 2,
          y: index * Y_SPACING + Y_SPACING / 2,
        };
      }
    });
    
    const renderedNodes = sortedCommits.filter(c => c.sha && positions[c.sha]).map(commit => ({
      ...commit,
      pos: positions[commit.sha],
    }));

    const renderedEdges = renderedNodes.flatMap(commit => {
      return (commit.parents || [])
        .filter(parentSha => positions[parentSha])
        .map(parentSha => {
          const from = positions[commit.sha];
          const to = positions[parentSha];
          const color = colorMap[commit.branch] || '#ccc';

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
    const width = (Math.max(...Object.values(branchLanes)) - minLane + 1) * dynamicXSpacing;

    return { nodes: renderedNodes, edges: renderedEdges, branchColorMap: colorMap, graphHeight: height, graphWidth: width, xSpacing: dynamicXSpacing };
  }, [repoData]);
  
  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-center text-muted-foreground">No commits to display for the selected filter.</div>;
  }

  return (
    <TransformWrapper
      minScale={0.1}
      limitToBounds={false}
      panning={{ velocityDisabled: true }}
    >
      <TransformComponent
        wrapperStyle={{ width: '100%', height: '100%' }}
        contentStyle={{ width: graphWidth, height: graphHeight }}
      >
        <div className="relative" style={{ width: graphWidth, height: graphHeight }}>
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
                xSpacing={xSpacing}
              />
            ))}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
