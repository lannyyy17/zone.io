export type SignalData = {
  latitude: number;
  longitude: number;
  signal_strength: number;
};

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const generateMockData = (count: number): SignalData[] => {
  const center = { lat: 37.7749, lng: -122.4194 }; // San Francisco
  const data: SignalData[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      latitude: center.lat + randomInRange(-0.15, 0.15),
      longitude: center.lng + randomInRange(-0.2, 0.2),
      signal_strength: Math.floor(randomInRange(5, 100)),
    });
  }
  return data;
};

export const networkSignals: SignalData[] = generateMockData(250);
