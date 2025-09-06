import type { RepoData, Commit, Branch } from './types';

// A simple deterministic hash function for generating SHAs
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

const generateSha = (message: string, date: string, parents: string[]) => {
  return hashCode(`${message}${date}${parents.join('')}`).slice(0, 40);
};

const authors = [
  { name: 'Alice', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/seed/Alice/40/40' },
  { name: 'Bob', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/seed/Bob/40/40' },
  { name: 'Charlie', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/seed/Charlie/40/40' },
  { name: 'Diana', email: 'diana@example.com', avatarUrl: 'https://picsum.photos/seed/Diana/40/40' },
  { name: 'Eve', email: 'eve@example.com', avatarUrl: 'https://picsum.photos/seed/Eve/40/40' },
];

const featureTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
const featureTopics = ['api', 'ui', 'db', 'auth', 'billing', 'search', 'calendar', 'notifications', 'ci', 'deps'];

function generateRandomCommitMessage() {
  const type = featureTypes[Math.floor(Math.random() * featureTypes.length)];
  const topic = featureTopics[Math.floor(Math.random() * featureTopics.length)];
  return `${type}(${topic}): ${Math.random().toString(36).substring(2, 15)}`;
}

export const fetchRepoData = (url: string): Promise<RepoData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        const NUM_BRANCHES = url.includes('cal.com') ? 100 : 5;
        const COMMITS_PER_BRANCH = 5;

        let commits: Commit[] = [];
        let branches: Branch[] = [];
        let date = new Date('2023-01-01T10:00:00Z');

        const nextDate = () => {
            date.setHours(date.getHours() + Math.random() * 12 + 1);
            if (date > new Date()) {
                date = new Date();
            }
            return date.toISOString();
        };

        // Create main branch
        let parentSha = generateSha('Initial commit', nextDate(), []);
        const mainBranch: Branch = { name: 'main', lastCommitSha: parentSha };
        branches.push(mainBranch);
        
        let mainCommit: Commit = {
            sha: parentSha,
            message: 'Initial commit',
            author: authors[0],
            date: date.toISOString(),
            parents: [],
            branch: 'main',
            diff: 'Initial project setup'
        };
        commits.push(mainCommit);

        for(let i = 0; i < 10; i++) {
            const newDate = nextDate();
            const newSha = generateSha(`Update main ${i}`, newDate, [parentSha]);
            const newCommit: Commit = {
                sha: newSha,
                message: `Update main branch ${i}`,
                author: authors[i % authors.length],
                date: newDate,
                parents: [parentSha],
                branch: 'main',
                diff: `diff for main update ${i}`
            };
            commits.push(newCommit);
            parentSha = newSha;
        }
        mainBranch.lastCommitSha = parentSha;


        // Create feature branches
        for (let i = 0; i < NUM_BRANCHES; i++) {
            const branchName = `feature/${featureTopics[i % featureTopics.length]}-${i}`;
            
            // Branch off from a random commit on main
            const mainCommits = commits.filter(c => c.branch === 'main');
            let branchParentCommit = mainCommits[Math.floor(Math.random() * mainCommits.length)];
            let currentBranchParentSha = branchParentCommit.sha;

            for (let j = 0; j < COMMITS_PER_BRANCH; j++) {
                const newDate = nextDate();
                const newMessage = generateRandomCommitMessage();
                const newSha = generateSha(newMessage, newDate, [currentBranchParentSha]);
                const newCommit: Commit = {
                    sha: newSha,
                    message: newMessage,
                    author: authors[(i + j) % authors.length],
                    date: newDate,
                    parents: [currentBranchParentSha],
                    branch: branchName,
                    diff: `diff for ${newMessage}`
                };
                commits.push(newCommit);
                currentBranchParentSha = newSha;

                // Create a branch pointer
                if(j === COMMITS_PER_BRANCH - 1) {
                    branches.push({ name: branchName, lastCommitSha: newSha });
                }
            }

            // Occasionally merge back to main
            if (i % 3 === 0) {
                 const mergeDate = nextDate();
                 const mergeMessage = `Merge branch '${branchName}' into main`;
                 const mergeCommitSha = generateSha(mergeMessage, mergeDate, [mainBranch.lastCommitSha, currentBranchParentSha]);
                 const mergeCommit: Commit = {
                     sha: mergeCommitSha,
                     message: mergeMessage,
                     author: authors[0],
                     date: mergeDate,
                     parents: [mainBranch.lastCommitSha, currentBranchParentSha],
                     branch: 'main',
                     diff: '...merge diff...'
                 };
                 commits.push(mergeCommit);
                 mainBranch.lastCommitSha = mergeCommitSha;
            }
        }
        
        // Add master as an alias for main
        const masterBranch = branches.find(b => b.name === 'main');
        if (masterBranch) {
          branches.push({ name: 'master', lastCommitSha: masterBranch.lastCommitSha });
        }
        
        const mockRepoData: RepoData = {
          branches,
          commits,
        };

        resolve(mockRepoData);
    }, 1000);
  });
};
