import type { Session, NetworkSignal } from './types';

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    startTime: new Date('2024-07-20T10:00:00Z').getTime(),
    endTime: new Date('2024-07-20T10:30:00Z').getTime(),
    locationName: 'Downtown Office',
  },
  {
    id: 'session-2',
    userId: 'user-1',
    startTime: new Date('2024-07-21T14:00:00Z').getTime(),
    endTime: new Date('2024-07-21T14:45:00Z').getTime(),
    locationName: 'Home Network Scan',
  },
  {
    id: 'session-3',
    userId: 'user-1',
    startTime: new Date('2024-07-22T09:15:00Z').getTime(),
    endTime: null, // Active session
    locationName: 'University Library',
  },
];

export const mockNetworkSignals: NetworkSignal[] = [
  // Data for Downtown Office (session-1)
  { id: 'sig-1', sessionId: 'session-1', latitude: 34.0522, longitude: -118.2437, signalStrength: -55, timestamp: new Date('2024-07-20T10:01:00Z').getTime() },
  { id: 'sig-2', sessionId: 'session-1', latitude: 34.0525, longitude: -118.2440, signalStrength: -85, timestamp: new Date('2024-07-20T10:05:00Z').getTime() },
  { id: 'sig-3', sessionId: 'session-1', latitude: 34.0530, longitude: -118.2445, signalStrength: -45, timestamp: new Date('2024-07-20T10:10:00Z').getTime() },
  { id: 'sig-4', sessionId: 'session-1', latitude: 34.0528, longitude: -118.2430, signalStrength: -65, timestamp: new Date('2024-07-20T10:15:00Z').getTime() },

  // Data for Home Network Scan (session-2)
  { id: 'sig-5', sessionId: 'session-2', latitude: 34.0600, longitude: -118.2500, signalStrength: -42, timestamp: new Date('2024-07-21T14:02:00Z').getTime() },
  { id: 'sig-6', sessionId: 'session-2', latitude: 34.0605, longitude: -118.2505, signalStrength: -78, timestamp: new Date('2024-07-21T14:10:00Z').getTime() },
  { id: 'sig-7', sessionId: 'session-2', latitude: 34.0610, longitude: -118.2510, signalStrength: -90, timestamp: new Date('2024-07-21T14:20:00Z').getTime() },
  { id: 'sig-8', sessionId: 'session-2', latitude: 34.0595, longitude: -118.2495, signalStrength: -50, timestamp: new Date('2024-07-21T14:30:00Z').getTime() },
  
  // Data for University Library (session-3)
  { id: 'sig-9', sessionId: 'session-3', latitude: 34.0224, longitude: -118.2851, signalStrength: -60, timestamp: new Date('2024-07-22T09:16:00Z').getTime() },
  { id: 'sig-10', sessionId: 'session-3', latitude: 34.0220, longitude: -118.2855, signalStrength: -75, timestamp: new Date('2024-07-22T09:20:00Z').getTime() },
];
