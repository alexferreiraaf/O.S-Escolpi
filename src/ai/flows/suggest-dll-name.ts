'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest alternative DLL names based on the client name.
 *
 * - `suggestDllName` - A function that takes a client name as input and returns a suggested DLL name.
 * - `SuggestDllNameInput` - The input type for the suggestDllName function.
 * - `SuggestDllNameOutput` - The output type for the suggestDllName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDllNameInputSchema = z.object({
  clientName: z.string().describe('The name of the client.'),
});
export type SuggestDllNameInput = z.infer<typeof SuggestDllNameInputSchema>;

const SuggestDllNameOutputSchema = z.object({
  suggestedDllName: z.string().describe('A suggested DLL name based on the client name.'),
});
export type SuggestDllNameOutput = z.infer<typeof SuggestDllNameOutputSchema>;

export async function suggestDllName(input: SuggestDllNameInput): Promise<SuggestDllNameOutput> {
  return suggestDllNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDllNamePrompt',
  input: {schema: SuggestDllNameInputSchema},
  output: {schema: SuggestDllNameOutputSchema},
  prompt: `Based on the client name "{{{clientName}}}", suggest a suitable DLL name. The DLL name should be relevant to the client's business or operations.`,
});

const suggestDllNameFlow = ai.defineFlow(
  {
    name: 'suggestDllNameFlow',
    inputSchema: SuggestDllNameInputSchema,
    outputSchema: SuggestDllNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
