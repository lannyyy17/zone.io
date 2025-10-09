import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export type SignalData = {
  id: string;
  timestamp: string;
  carrier: 'AT&T' | 'Verizon' | 'T-Mobile';
  rssi: number;
  latitude: number;
  longitude: number;
};

interface RawDataTableProps {
  data: SignalData[];
  onRowClick: (data: SignalData) => void;
}

function getRssiBadgeVariant(rssi: number): 'default' | 'secondary' | 'destructive' {
  if (rssi > -90) return 'default'; // Good signal
  if (rssi > -100) return 'secondary'; // Fair signal
  return 'destructive'; // Poor signal
}

export function RawDataTable({ data, onRowClick }: RawDataTableProps) {
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
        {data.map((dataPoint) => (
          <TableRow key={dataPoint.id} onClick={() => onRowClick(dataPoint)} className="cursor-pointer">
            <TableCell>
              {new Date(dataPoint.timestamp).toLocaleTimeString()}
            </TableCell>
            <TableCell>{dataPoint.carrier}</TableCell>
            <TableCell>
              <Badge variant={getRssiBadgeVariant(dataPoint.rssi)}>{dataPoint.rssi}</Badge>
            </TableCell>
            <TableCell>
              {dataPoint.latitude.toFixed(4)}, {dataPoint.longitude.toFixed(4)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
