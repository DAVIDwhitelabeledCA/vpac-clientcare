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
import { clientDocumentsData, documentTemplatesData } from '@/lib/mock-data';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientDocumentsPage() {
  const { user } = useUser();

  const clientDocuments = useMemo(() => {
    if (!user?.email) return [];
    
    const email = user.email.toLowerCase();
    return clientDocumentsData
      .filter((doc) => doc.clientEmail?.toLowerCase() === email)
      .map((doc) => {
        const template = documentTemplatesData.find(
          (t) => t.documentId === doc.documentId
        );
        return {
          ...doc,
          title: template?.title || 'Unknown Document',
        };
      })
      .sort((a, b) => {
        // Sort by upload date, most recent first
        const dateA = new Date(a.uploadDateTime).getTime();
        const dateB = new Date(b.uploadDateTime).getTime();
        return dateB - dateA;
      });
  }, [user]);

  const availableTemplates = useMemo(() => {
    return documentTemplatesData.map((template) => {
      const hasDocument = clientDocuments.some(
        (doc) => doc.documentId === template.documentId
      );
      return {
        ...template,
        hasDocument,
      };
    });
  }, [clientDocuments]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">
          View and manage your submitted documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText /> My Documents
          </CardTitle>
          <CardDescription>
            Documents you have submitted to the clinic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              You have not uploaded any documents yet.
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Upload /> Available Document Templates
          </CardTitle>
          <CardDescription>
            Document templates you can download and submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableTemplates.map((template) => (
              <div
                key={template.documentId}
                className="flex items-center justify-between p-4 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{template.title}</p>
                    {template.hasDocument && (
                      <p className="text-xs text-muted-foreground">
                        Already submitted
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Download Template
                  </Button>
                  {!template.hasDocument && (
                    <Button variant="default" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
