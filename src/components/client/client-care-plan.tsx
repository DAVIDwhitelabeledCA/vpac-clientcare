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
import { Badge } from '@/components/ui/badge';
import { carePlanData, staffData } from '@/lib/mock-data';
import { ClipboardList } from 'lucide-react';

interface ClientCarePlanProps {
  clientEmail: string;
}

export default function ClientCarePlan({ clientEmail }: ClientCarePlanProps) {
  const clientCarePlan = useMemo(() => {
    return carePlanData
      .filter((plan) => plan.clientEmail === clientEmail)
      .map((plan) => {
        const staff = staffData.find((s) => s.email === plan.staffEmail);
        return {
          ...plan,
          staffName: staff?.name || 'Unknown',
        };
      });
  }, [clientEmail]);

  if (clientCarePlan.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Care Plan Found</CardTitle>
          <CardDescription>
            This client does not have an active care plan.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <ClipboardList /> Care Plan
        </CardTitle>
        <CardDescription>
          Assigned tasks and wellness goals for the client.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Assigned By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientCarePlan.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.date}</TableCell>
                <TableCell>{plan.task}</TableCell>
                <TableCell>{plan.staffName}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      plan.status === 'Complete' ? 'default' : 'secondary'
                    }
                  >
                    {plan.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
