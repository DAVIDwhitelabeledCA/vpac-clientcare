'use client';

import { useState } from 'react';
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
import { useDocuments } from '@/hooks/use-documents';
import { DocumentUpload } from '@/components/document-upload';
import { FileText, Upload, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ClientDocumentsPage() {
  const { user } = useUser();
  const { documents, loading, error } = useDocuments();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger a refresh by updating the key
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            View and manage your submitted documents.
          </p>
        </div>
        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-4">
              Error loading documents: {error.message}
            </p>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                You have not uploaded any documents yet.
              </p>
              <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(doc.uploadDate, 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                      >
                        <Download className="mr-2 h-4 w-4" />
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
    </div>
  );
}
