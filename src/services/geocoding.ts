'use server';

import opencage from 'opencage-api-client';

export async function getAddressFromCoordinates(lat: number, lon: number): Promise<string> {

    // IMPORTANT: In a real application, you would secure this API key.
    // For this demo, we are using it directly on the server-side.
    // Never expose this key on the client-side.
    const apiKey = process.env.OPENCAGE_API_KEY;

    if (!apiKey) {
        throw new Error("OpenCage API key is not configured.");
    }
    
    try {
        const data = await opencage.geocode({ q: `${lat}, ${lon}`, key: apiKey, language: 'en' });
        if (data.status.code === 200 && data.results.length > 0) {
            return data.results[0].formatted;
        } else {
            console.log('OpenCage API Status:', data.status.message);
            throw new Error('No results found for the given coordinates.');
        }
    } catch (error: any) {
        console.error('Error in geocoding request:', error.message);
        throw new Error('Failed to fetch address from geocoding service.');
    }
}
