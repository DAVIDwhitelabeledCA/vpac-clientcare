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
import { Badge } from '@/components/ui/badge';
import { carePlanData, staffData } from '@/lib/mock-data';
import { ClipboardList } from 'lucide-react';

export default function ClientCarePlanPage() {
  const { user } = useUser();

  const clientCarePlan = useMemo(() => {
    if (!user?.email) return [];
    
    const email = user.email.toLowerCase();
    return carePlanData
      .filter((plan) => plan.clientEmail?.toLowerCase() === email)
      .map((plan) => {
        const staff = staffData.find((s) => s.email === plan.staffEmail);
        return {
          ...plan,
          staffName: staff?.name || 'Unknown',
        };
      })
      .sort((a, b) => {
        // Sort by date, most recent first
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
  }, [user]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Care Plan</h2>
        <p className="text-muted-foreground">
          View your assigned tasks and wellness goals.
        </p>
      </div>

      {clientCarePlan.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Care Plan Found</CardTitle>
            <CardDescription>
              You do not have an active care plan.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ClipboardList /> Care Plan
            </CardTitle>
            <CardDescription>
              Assigned tasks and wellness goals for your care.
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
      )}
    </div>
  );
}
