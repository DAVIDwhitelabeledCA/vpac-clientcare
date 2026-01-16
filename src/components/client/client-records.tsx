'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { recordsData, staffData } from '@/lib/mock-data';
import { Stethoscope } from 'lucide-react';
import { Button } from '../ui/button';

interface ClientRecordsProps {
  clientEmail: string;
}

export default function ClientRecords({ clientEmail }: ClientRecordsProps) {
  const clientRecords = useMemo(() => {
    return recordsData
      .filter((rec) => rec.clientEmail === clientEmail)
      .map((rec) => {
        const staff = staffData.find((s) => s.email === rec.staffEmail);
        return {
          ...rec,
          staffName: staff?.name || 'Unknown',
        };
      });
  }, [clientEmail]);

  if (clientRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Records Found</CardTitle>
          <CardDescription>
            This client does not have any medical records on file.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Stethoscope /> Medical Records
        </CardTitle>
        <CardDescription>
          Lab results, medications, and other medical records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientRecords.map((rec) => (
              <TableRow key={rec.recordId}>
                <TableCell>{rec.uploadDateTime}</TableCell>
                <TableCell className="font-medium">{rec.type}</TableCell>
                <TableCell>{rec.staffName}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" disabled={!rec.record}>
                    View Record
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
