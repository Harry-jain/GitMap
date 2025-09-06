'use server';

import {ai} from '@/ai/genkit';
import { summarizeCommitDetails } from '@/ai/flows/summarize-commit-details';
import type { Commit } from '@/lib/types';
import { z } from 'zod';

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
