'use server';

/**
 * @fileOverview An AI agent that suggests alternative client names based on previously entered names.
 *
 * - suggestClientName - A function that handles the suggestion of client names.
 * - SuggestClientNameInput - The input type for the suggestClientName function.
 * - SuggestClientNameOutput - The return type for the suggestClientName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestClientNameInputSchema = z.object({
  partialClientName: z
    .string()
    .describe('The partial name of the client to find suggestions for.'),
  existingClientNames: z
    .array(z.string())
    .describe('A list of existing client names to use for generating suggestions.'),
});

export type SuggestClientNameInput = z.infer<typeof SuggestClientNameInputSchema>;

const SuggestClientNameOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested client names based on the partial name.'),
});

export type SuggestClientNameOutput = z.infer<typeof SuggestClientNameOutputSchema>;

export async function suggestClientName(input: SuggestClientNameInput): Promise<SuggestClientNameOutput> {
  return suggestClientNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestClientNamePrompt',
  input: {schema: SuggestClientNameInputSchema},
  output: {schema: SuggestClientNameOutputSchema},
  prompt: `You are a helpful assistant that suggests client names based on a partial name and a list of existing client names.

  Given the partial name "{{partialClientName}}" and the following list of existing client names:
  {{#each existingClientNames}}
  - "{{this}}"
  {{/each}}

  Suggest client names that start with the given partial name, but are not already in the list of existing names. Suggest at most 5 names.
  Return the suggestions as a JSON array of strings. Do not include duplicates.
  `,
});

const suggestClientNameFlow = ai.defineFlow(
  {
    name: 'suggestClientNameFlow',
    inputSchema: SuggestClientNameInputSchema,
    outputSchema: SuggestClientNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
