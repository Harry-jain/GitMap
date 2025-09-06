export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  parents: string[];
  diff?: string;
  branch: string;
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
