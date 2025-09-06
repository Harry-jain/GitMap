export interface Commit {
  sha: string;
  message: string | null;
  author: {
    name: string;
    email: string;
    date: string;
    avatarUrl?: string;
  } | null;
  parents: string[];
  diff?: string;
  branch: string;
  date: string | null; // Keep this for sorting
}

export interface Branch {
  name: string;
  lastCommitSha: string;
}

export interface RepoData {
  commits: Commit[];
  branches: Branch[];
}

export type BranchColorMap = {
  [key: string]: string;
};
