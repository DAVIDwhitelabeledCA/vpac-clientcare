'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
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
import { Button } from '@/components/ui/button';

export default function ClientRecordsPage() {
  const { user } = useUser();

  const clientRecords = useMemo(() => {
    if (!user?.email) return [];
    
    const email = user.email.toLowerCase();
    return recordsData
      .filter((rec) => rec.clientEmail?.toLowerCase() === email)
      .map((rec) => {
        const staff = staffData.find((s) => s.email === rec.staffEmail);
        return {
          ...rec,
          staffName: staff?.name || 'Unknown',
        };
      });
  }, [user]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
        <p className="text-muted-foreground">
          View your medical records, lab results, and medications.
        </p>
      </div>

      {clientRecords.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Records Found</CardTitle>
            <CardDescription>
              You do not have any medical records on file.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
