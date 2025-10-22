'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

export function DownloadTimeCalculator() {
  const [fileSize, setFileSize] = useState('');
  const [fileSizeUnit, setFileSizeUnit] = useState('MB');
  const [speed, setSpeed] = useState('');
  const [speedUnit, setSpeedUnit] = useState('Mbps');
  const [result, setResult] = useState('');

  const calculateTime = () => {
    const size = parseFloat(fileSize);
    const downloadSpeed = parseFloat(speed);

    if (isNaN(size) || isNaN(downloadSpeed) || size <= 0 || downloadSpeed <= 0) {
      setResult('Please enter valid, positive numbers.');
      return;
    }

    let sizeInBits;
    switch (fileSizeUnit) {
        case 'MB':
            sizeInBits = size * 1024 * 1024 * 8;
            break;
        case 'GB':
            sizeInBits = size * 1024 * 1024 * 1024 * 8;
            break;
        case 'TB':
            sizeInBits = size * 1024 * 1024 * 1024 * 1024 * 8;
            break;
        default:
            sizeInBits = 0;
    }

    let speedInBps;
    switch(speedUnit) {
        case 'bps':
            speedInBps = downloadSpeed;
            break;
        case 'kbps':
            speedInBps = downloadSpeed * 1000;
            break;
        case 'Mbps':
            speedInBps = downloadSpeed * 1000 * 1000;
            break;
        case 'Gbps':
            speedInBps = downloadSpeed * 1000 * 1000 * 1000;
            break;
        case 'MBps':
            speedInBps = downloadSpeed * 1024 * 1024 * 8;
            break;
        case 'GBps':
            speedInBps = downloadSpeed * 1024 * 1024 * 1024 * 8;
            break;
        default:
            speedInBps = 0;
    }

    if (speedInBps === 0) {
        setResult('Invalid speed unit selected.');
        return;
    }

    const timeInSeconds = sizeInBits / speedInBps;

    formatTime(timeInSeconds);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) {
        setResult(`${(seconds * 1000).toPrecision(3)} milliseconds`);
    } else if (seconds < 60) {
      setResult(`${seconds.toPrecision(3)} seconds`);
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      setResult(`${minutes} min ${remainingSeconds} sec`);
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      setResult(`${hours} hr ${remainingMinutes} min`);
    } else {
        const days = Math.floor(seconds / 86400);
        const remainingHours = Math.floor((seconds % 86400) / 3600);
        setResult(`${days} day(s) ${remainingHours} hr`);
    }
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock />
                        Download Time Calculator
                    </CardTitle>
                    <CardDescription>
                        Estimate how long a download will take.
                    </CardDescription>
                </CardHeader>
            </Card>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Download Time Calculator</DialogTitle>
                <DialogDescription>
                    Estimate how long a download will take based on file size and speed.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="file-size">File Size</Label>
                <div className="flex gap-2">
                  <Input
                    id="file-size"
                    type="number"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g., 100"
                  />
                  <Select value={fileSizeUnit} onValueChange={setFileSizeUnit}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MB">MB</SelectItem>
                      <SelectItem value="GB">GB</SelectItem>
                      <SelectItem value="TB">TB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="speed">Download Speed</Label>
                <div className="flex gap-2">
                  <Input
                    id="speed"
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    placeholder="e.g., 50"
                  />
                  <Select value={speedUnit} onValueChange={setSpeedUnit}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bps">bps</SelectItem>
                      <SelectItem value="kbps">kbps</SelectItem>
                      <SelectItem value="Mbps">Mbps</SelectItem>
                      <SelectItem value="Gbps">Gbps</SelectItem>
                      <SelectItem value="MBps">MBps</SelectItem>
                      <SelectItem value="GBps">GBps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={calculateTime} className="mt-4 w-full">
              Calculate
            </Button>
            {result && (
              <div className="mt-4 rounded-md bg-muted p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">Estimated Time:</p>
                <p className="text-lg font-semibold text-primary">{result}</p>
              </div>
            )}
        </DialogContent>
    </Dialog>
  );
}
