import type { RepoData } from './types';

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
];

let date = new Date('2023-10-01T10:00:00Z');
const nextDate = () => {
  date.setHours(date.getHours() + Math.random() * 5 + 1);
  return date.toISOString();
};

const c1Date = nextDate();
const c1Sha = generateSha('Initial commit', c1Date, []);
const c1 = { sha: c1Sha, message: 'Initial commit\n\n- Setup project structure\n- Add basic configuration', author: authors[0], date: c1Date, parents: [], branch: 'main', diff: `
diff --git a/package.json b/package.json
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/package.json
@@ -0,0 +1,10 @@
+{
+  "name": "gitmap-example",
+  "version": "1.0.0",
+  "description": "",
+  "main": "index.js",
+  "scripts": {
+    "test": "echo \"Error: no test specified\" && exit 1"
+  },
+  "keywords": [],
+  "author": "",
+  "license": "ISC"
+}
` };

const c2Date = nextDate();
const c2Sha = generateSha('Add README', c2Date, [c1Sha]);
const c2 = { sha: c2Sha, message: 'feat: Add README file', author: authors[0], date: c2Date, parents: [c1Sha], branch: 'main', diff: `
diff --git a/README.md b/README.md
new file mode 100644
index 0000000..d3b5b49
--- /dev/null
+++ b/README.md
@@ -0,0 +1 @@
+# GitMap Example
` };

const c3Date = nextDate();
const c3Sha = generateSha('Start feature A', c3Date, [c2Sha]);
const c3 = { sha: c3Sha, message: 'feat(sidebar): Start feature A\n\n- Add sidebar component', author: authors[1], date: c3Date, parents: [c2Sha], branch: 'feature/sidebar', diff: `
diff --git a/src/components/Sidebar.js b/src/components/Sidebar.js
new file mode 100644
index 0000000..a1b2c3d
--- /dev/null
+++ b/src/components/Sidebar.js
@@ -0,0 +1,5 @@
+function Sidebar() {
+  return <div>Sidebar</div>;
+}
+
+export default Sidebar;
` };

const c4Date = nextDate();
const c4Sha = generateSha('Update styles', c4Date, [c2Sha]);
const c4 = { sha: c4Sha, message: 'style: Update button styles', author: authors[0], date: c4Date, parents: [c2Sha], branch: 'main', diff: `
diff --git a/src/styles/buttons.css b/src/styles/buttons.css
new file mode 100644
index 0000000..f9e8d7c
--- /dev/null
+++ b/src/styles/buttons.css
@@ -0,0 +1,3 @@
+.button {
+  background-color: #007bff;
+}
` };

const c5Date = nextDate();
const c5Sha = generateSha('Implement API call', c5Date, [c3Sha]);
const c5 = { sha: c5Sha, message: 'feat(sidebar): Implement API call for user data', author: authors[1], date: c5Date, parents: [c3Sha], branch: 'feature/sidebar', diff: `
diff --git a/src/components/Sidebar.js b/src/components/Sidebar.js
index a1b2c3d..b4c5d6e
--- a/src/components/Sidebar.js
+++ b/src/components/Sidebar.js
@@ -1,5 +1,9 @@
+import { useEffect } from 'react';
+
 function Sidebar() {
+  useEffect(() => {
+    fetch('/api/user');
+  }, []);
   return <div>Sidebar</div>;
 }
-
 export default Sidebar;
` };

const c6Date = nextDate();
const c6Sha = generateSha('Add login form', c6Date, [c4Sha]);
const c6 = { sha: c6Sha, message: 'feat(auth): Add login form', author: authors[2], date: c6Date, parents: [c4Sha], branch: 'feature/login', diff: `
diff --git a/src/components/LoginForm.js b/src/components/LoginForm.js
new file mode 100644
index 0000000..e7f8g9h
--- /dev/null
+++ b/src/components/LoginForm.js
@@ -0,0 +1,5 @@
+function LoginForm() {
+  return <form>Login</form>;
+}
+
+export default LoginForm;
` };

const c7Date = nextDate();
const c7Sha = generateSha('Merge feature/sidebar', c7Date, [c4Sha, c5Sha]);
const c7 = { sha: c7Sha, message: 'Merge pull request #12 from feature/sidebar\n\nFeat(sidebar): Complete sidebar implementation', author: authors[0], date: c7Date, parents: [c4Sha, c5Sha], branch: 'main', diff: '... merge sidebar diff ...' };

const c8Date = nextDate();
const c8Sha = generateSha('Fix login bug', c8Date, [c6Sha]);
const c8 = { sha: c8Sha, message: 'fix(auth): Fix validation bug in login form', author: authors[2], date: c8Date, parents: [c6Sha], branch: 'feature/login', diff: `
diff --git a/src/components/LoginForm.js b/src/components/LoginForm.js
index e7f8g9h..f1g2h3i4
--- a/src/components/LoginForm.js
+++ b/src/components/LoginForm.js
@@ -1,5 +1,8 @@
 function LoginForm() {
-  return <form>Login</form>;
+  const handleSubmit = () => {};
+  return <form onSubmit={handleSubmit}>Login</form>;
 }
 
 export default LoginForm;
` };

const c9Date = nextDate();
const c9Sha = generateSha('Refactor auth service', c9Date, [c8Sha]);
const c9 = { sha: c9Sha, message: 'refactor(auth): Refactor auth service to use classes', author: authors[2], date: c9Date, parents: [c8Sha], branch: 'feature/login', diff: '... auth refactor diff ...' };

const c10Date = nextDate();
const c10Sha = generateSha('Merge feature/login', c10Date, [c7Sha, c9Sha]);
const c10 = { sha: c10Sha, message: 'Merge pull request #23 from feature/login\n\nFeat(auth): Login functionality', author: authors[0], date: c10Date, parents: [c7Sha, c9Sha], branch: 'main', diff: '... merge login diff ...' };

const c11Date = nextDate();
const c11Sha = generateSha('Release v1.0.0', c11Date, [c10Sha]);
const c11 = { sha: c11Sha, message: 'chore: Release v1.0.0', author: authors[0], date: c11Date, parents: [c10Sha], branch: 'main', diff: '... release diff ...' };

const mockRepoData: RepoData = {
  branches: [
    { name: 'main', lastCommitSha: c11Sha },
    { name: 'feature/sidebar', lastCommitSha: c5Sha },
    { name: 'feature/login', lastCommitSha: c9Sha },
  ],
  commits: [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11],
};

export const fetchRepoData = (url: string): Promise<RepoData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRepoData);
    }, 1000);
  });
};
