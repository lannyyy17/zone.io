import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type SignalData = {
  id: string;
  timestamp: string;
  carrier: 'AT&T' | 'Verizon' | 'T-Mobile';
  rssi: number;
  latitude: number;
  longitude: number;
};

const mockData: SignalData[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    carrier: 'Verizon',
    rssi: -85,
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    carrier: 'AT&T',
    rssi: -92,
    latitude: 34.053,
    longitude: -118.244,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    carrier: 'T-Mobile',
    rssi: -78,
    latitude: 34.054,
    longitude: -118.245,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    carrier: 'Verizon',
    rssi: -88,
    latitude: 34.055,
    longitude: -118.246,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    carrier: 'AT&T',
    rssi: -95,
    latitude: 34.056,
    longitude: -118.247,
  },
];

function getRssiBadgeVariant(rssi: number): 'default' | 'secondary' | 'destructive' {
  if (rssi > -90) return 'default'; // Good signal
  if (rssi > -100) return 'secondary'; // Fair signal
  return 'destructive'; // Poor signal
}

export function RawDataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>RSSI (dBm)</TableHead>
          <TableHead>Coordinates</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockData.map((data) => (
          <TableRow key={data.id}>
            <TableCell>
              {new Date(data.timestamp).toLocaleTimeString()}
            </TableCell>
            <TableCell>{data.carrier}</TableCell>
            <TableCell>
              <Badge variant={getRssiBadgeVariant(data.rssi)}>{data.rssi}</Badge>
            </TableCell>
            <TableCell>
              {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
