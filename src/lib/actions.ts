'use server';

import {ai} from '@/ai/genkit';
import {summarizeCommitDetails} from '@/ai/flows/summarize-commit-details';
import type {Commit, RepoData} from '@/lib/types';
import {z} from 'zod';

export async function getCommitSummary(commit: Commit) {
  try {
    const result = await summarizeCommitDetails({
      commitMessage: commit.message,
      commitDiff: commit.diff || 'No diff available.',
    });
    return result.summary;
  } catch (error) {
    console.error('AI summary failed:', error);
    return 'Could not generate a summary for this commit.';
  }
}

async function getRepoAndOwner(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL');
  }
  return {owner: match[1], repo: match[2].replace('.git', '')};
}

export async function fetchRepoData(url: string): Promise<RepoData> {
  const {owner, repo} = await getRepoAndOwner(url);

  const headers: HeadersInit = {
    'User-Agent': 'GitMap/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [commitsRes, branchesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, {
      headers,
    }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {headers}),
  ]);

  if (!commitsRes.ok || !branchesRes.ok) {
    throw new Error(`Failed to fetch data from GitHub. Status: ${commitsRes.status}, ${branchesRes.status}`);
  }

  const rawCommits = await commitsRes.json();
  const rawBranches = await branchesRes.json();

  const branches = rawBranches.map((branch: any) => ({
    name: branch.name,
    lastCommitSha: branch.commit.sha,
  }));

  const commitShaToBranch: {[sha: string]: string} = {};
  for (const branch of branches) {
    // This is not perfectly accurate as a commit can be in multiple branches.
    // We'll do a full mapping later.
    commitShaToBranch[branch.lastCommitSha] = branch.name;
  }
  
  const commits: Commit[] = rawCommits.map((commit: any) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.author
      ? {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          avatarUrl: commit.author.avatar_url,
        }
      : {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
    parents: commit.parents.map((p: any) => p.sha),
    diff: '', // Diff is not fetched in this basic version
    date: commit.commit.author.date,
    branch: 'main'
  }));

  // Naive branch assignment: find which branch contains this commit
  // This is a simplified approach. A real implementation is much more complex.
  const commitBranchMap: Record<string, string> = {};

  for (const branch of branches) {
    try {
      // Limit to a smaller number of commits per branch to avoid rate-limiting on very active branches
      const branchCommitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=50`, { headers });
      if(branchCommitsRes.ok) {
        const branchCommits = await branchCommitsRes.json();
        for (const commit of branchCommits) {
          if (!commitBranchMap[commit.sha]) {
            commitBranchMap[commit.sha] = branch.name;
          }
        }
      }
    } catch(e) {
      console.warn(`Could not fetch commits for branch ${branch.name}`, e)
    }
  }

  // Assign branch to commit, defaulting to main/master or first available
  const mainBranchName = branches.find(b => b.name ==='main' || b.name === 'master')?.name || branches[0]?.name;
  commits.forEach(commit => {
    commit.branch = commitBranchMap[commit.sha] || mainBranchName;
  });


  return {commits, branches};
}
