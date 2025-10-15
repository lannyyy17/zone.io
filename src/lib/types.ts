
export type NetworkSignal = {
    id: string;
    latitude: number;
    longitude: number;
    signalStrength: number;
    sessionId: string;
    timestamp: number;
};
  
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
