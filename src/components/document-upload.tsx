'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Scan, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentUploadProps {
  clientId?: string; // If provided, staff is uploading for a client
  onUploadSuccess?: () => void;
  documentType?: string;
  templateId?: string;
}

export function DocumentUpload({
  clientId: propClientId,
  onUploadSuccess,
  documentType: propDocumentType,
  templateId: propTemplateId,
}: DocumentUploadProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState(propDocumentType || 'general');
  const [useOcr, setUseOcr] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine client ID - use prop if provided (staff upload), otherwise use current user
  const clientId = propClientId || user?.uid || '';
  const isStaffUpload = !!propClientId;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setOcrData(null);
    }
  };

  const handleOcrScan = async () => {
    if (!file) return;

    setOcrProcessing(true);
    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/documents/ocr', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'OCR failed');
      }

      const data = await response.json();
      setOcrData(data.ocrData);
      toast({
        title: 'OCR Complete',
        description: 'Document scanned successfully',
      });
    } catch (error: any) {
      toast({
        title: 'OCR Failed',
        description: error.message || 'Failed to scan document',
        variant: 'destructive',
      });
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !clientId || !user?.uid) {
      toast({
        title: 'Missing information',
        description: 'Please select a file and ensure you are logged in',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const token = await user.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientId);
      formData.append('uploadedBy', user.uid);
      formData.append('documentType', documentType);
      if (propTemplateId) {
        formData.append('templateId', propTemplateId);
      }
      if (ocrData) {
        formData.append('ocrData', JSON.stringify(ocrData));
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      toast({
        title: 'Upload Successful',
        description: 'Document uploaded successfully',
      });

      // Reset form
      setFile(null);
      setOcrData(null);
      setOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      onUploadSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading && !ocrProcessing) {
      setOpen(false);
      setFile(null);
      setOcrData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isStaffUpload ? 'Upload Document for Client' : 'Upload Document'}
          </DialogTitle>
          <DialogDescription>
            Upload a document to your account. You can use OCR to scan insurance cards or IDs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Document</SelectItem>
                <SelectItem value="insurance_card">Insurance Card</SelectItem>
                <SelectItem value="id">ID Card</SelectItem>
                <SelectItem value="medical_record">Medical Record</SelectItem>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              disabled={uploading || ocrProcessing}
            />
            {file && (
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setOcrData(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={uploading || ocrProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {(documentType === 'insurance_card' || documentType === 'id') && file && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOcrScan}
                  disabled={!file || ocrProcessing || uploading}
                >
                  {ocrProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="mr-2 h-4 w-4" />
                      Scan with OCR
                    </>
                  )}
                </Button>
                {ocrData && (
                  <span className="text-sm text-muted-foreground">✓ Scanned</span>
                )}
              </div>
              {ocrData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Scanned Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {ocrData.structuredData && Object.keys(ocrData.structuredData).length > 0 ? (
                        Object.entries(ocrData.structuredData).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span>{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">
                          {ocrData.text || 'No data extracted'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading || ocrProcessing}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading || ocrProcessing}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
