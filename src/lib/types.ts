import { z } from 'zod';

// Zod schema for Firestore Timestamp
export const TimestampSchema = z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
});

export const NetworkSignalSchema = z.object({
    id: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    signalStrength: z.number(),
    // Allow both the server-side Timestamp object and the client-side number
    timestamp: z.union([TimestampSchema, z.number(), z.any()]),
});
export type NetworkSignal = z.infer<typeof NetworkSignalSchema>;

export const SummarizeSessionInputSchema = z.object({
    signals: z.array(NetworkSignalSchema).describe("An array of network signal data points from the session."),
});
export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

export const SummarizeSessionOutputSchema = z.object({
    summary: z.string().describe("A concise, insightful summary of the network signal session, written in markdown format."),
});
export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;

export type Session = {
    id: string;
    userId: string;
    startTime: number;
    endTime: number | null;
    locationName?: string;
};

export type UserProfile = {
    id: string;
    email: string;
    displayName?: string;
};