'use client';

import { useState } from 'react';
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
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { useEffect } from 'react';

interface ClientDocumentsProps {
  clientEmail: string;
}

export default function ClientDocuments({ clientEmail }: ClientDocumentsProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { documents, loading, error } = useDocuments(clientId || undefined);

  // Find client ID from email
  useEffect(() => {
    const findClientId = async () => {
      try {
        const { firestore } = initializeFirebase();
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', clientEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setClientId(snapshot.docs[0].id);
        }
      } catch (err) {
        console.error('Error finding client ID:', err);
      }
    };
    findClientId();
  }, [clientEmail]);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, '_blank');
  };

  if (!clientId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div key={refreshKey}>
      <div className="flex items-center justify-between mb-4">
        <CardDescription>A list of all documents for this client.</CardDescription>
        <DocumentUpload clientId={clientId} onUploadSuccess={handleUploadSuccess} />
      </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText /> Client Documents
        </CardTitle>
          <CardDescription>A list of all documents submitted by or for the client.</CardDescription>
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
                This client has not uploaded any documents yet.
              </p>
              <DocumentUpload clientId={clientId} onUploadSuccess={handleUploadSuccess} />
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
