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
import { clientDocumentsData, documentTemplatesData } from '@/lib/mock-data';
import { FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface ClientDocumentsProps {
  clientEmail: string;
}

export default function ClientDocuments({ clientEmail }: ClientDocumentsProps) {
  const clientDocuments = useMemo(() => {
    return clientDocumentsData
      .filter((doc) => doc.clientEmail === clientEmail)
      .map((doc) => {
        const template = documentTemplatesData.find(
          (t) => t.documentId === doc.documentId
        );
        return {
          ...doc,
          title: template?.title || 'Unknown Document',
        };
      });
  }, [clientEmail]);

  if (clientDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Documents Found</CardTitle>
          <CardDescription>
            This client has not uploaded any documents.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText /> Client Documents
        </CardTitle>
        <CardDescription>A list of all documents submitted by the client.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>{doc.uploadDateTime}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" disabled={!doc.document}>
                    Download
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
