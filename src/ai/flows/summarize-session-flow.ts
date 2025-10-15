'use server';
/**
 * @fileOverview A flow to summarize a network signal session.
 * 
 * - summarizeSession - A function that handles the session summary process.
 */

import { ai } from '@/ai/genkit';
import { SummarizeSessionInputSchema, SummarizeSessionOutputSchema, type SummarizeSessionInput, type SummarizeSessionOutput } from '@/lib/types';


export async function summarizeSession(input: SummarizeSessionInput): Promise<SummarizeSessionOutput> {
  return summarizeSessionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'summarizeSessionPrompt',
  input: { schema: SummarizeSessionInputSchema },
  output: { schema: SummarizeSessionOutputSchema },
  prompt: `You are a network analysis expert. Your task is to analyze a session of collected WiFi signal strength data and provide a concise, insightful summary in HTML format.

The user has provided a series of data points, each containing a timestamp, latitude, longitude, and signal strength in dBm.

Based on the data provided in the 'signals' array:
1.  **Overall Assessment:** Start with a brief, one-sentence conclusion about the overall signal quality during the session (e.g., "Overall, the signal quality during this session was excellent, with only minor fluctuations."). Wrap this in a <p> tag.
2.  **Key Observations:** In an unordered list (<ul>), highlight 2-3 key observations. These could include:
    *   The location (latitude/longitude) of the strongest signal.
    *   The location of the weakest signal or any potential "dead zones".
    *   Any significant trends, like signal dropping dramatically over time or in a specific area.
3.  **Recommendation (Optional):** If there are clear problem areas, provide a brief, actionable recommendation in a <p> tag with a <strong>Recommendation:</strong> prefix. For example, "<p><strong>Recommendation:</strong> Consider placing a WiFi extender near the area around (lat, lon) to improve coverage.</p>"

Here is the data:
\`\`\`json
{{{json signals}}}
\`\`\`

Generate the summary now.`,
});


const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: SummarizeSessionInputSchema,
    outputSchema: SummarizeSessionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

    