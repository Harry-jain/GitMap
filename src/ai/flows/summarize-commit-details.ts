'use server';

/**
 * @fileOverview Summarizes the details of a Git commit using AI.
 *
 * - summarizeCommitDetails - A function that takes commit details and returns a summarized description.
 * - SummarizeCommitDetailsInput - The input type for the summarizeCommitDetails function.
 * - SummarizeCommitDetailsOutput - The return type for the summarizeCommitDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommitDetailsInputSchema = z.object({
  commitMessage: z.string().describe('The full commit message.'),
  commitDiff: z.string().describe('The diff of the commit.'),
});
export type SummarizeCommitDetailsInput = z.infer<typeof SummarizeCommitDetailsInputSchema>;

const SummarizeCommitDetailsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the commit changes.'),
});
export type SummarizeCommitDetailsOutput = z.infer<typeof SummarizeCommitDetailsOutputSchema>;

export async function summarizeCommitDetails(
  input: SummarizeCommitDetailsInput
): Promise<SummarizeCommitDetailsOutput> {
  return summarizeCommitDetailsFlow(input);
}

const summarizeCommitDetailsPrompt = ai.definePrompt({
  name: 'summarizeCommitDetailsPrompt',
  input: {schema: SummarizeCommitDetailsInputSchema},
  output: {schema: SummarizeCommitDetailsOutputSchema},
  prompt: `You are a software development expert. Your task is to summarize Git commit details into a concise and understandable summary.

  Here are the details of the commit:

  Commit Message: {{{commitMessage}}}
  Commit Diff: {{{commitDiff}}}

  Please provide a summary of the changes introduced by this commit, focusing on the key aspects and impact of the changes.
  The summary should be no more than 5 sentences long.
  `,
});

const summarizeCommitDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeCommitDetailsFlow',
    inputSchema: SummarizeCommitDetailsInputSchema,
    outputSchema: SummarizeCommitDetailsOutputSchema,
  },
  async input => {
    const {output} = await summarizeCommitDetailsPrompt(input);
    return output!;
  }
);
