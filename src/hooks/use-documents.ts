import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export interface Document {
  id: string;
  clientId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  templateId?: string | null;
  ocrData?: any;
  uploadDate: Date;
  createdAt: Date;
}

export function useDocuments(clientId?: string) {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        const { firestore } = initializeFirebase();
        const targetClientId = clientId || user.uid;
        
        const documentsRef = collection(
          firestore,
          `users/${targetClientId}/documents`
        );
        const q = query(documentsRef, orderBy('uploadDate', 'desc'));
        const snapshot = await getDocs(q);
        
        const docs: Document[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          docs.push({
            id: doc.id,
            ...data,
            uploadDate: data.uploadDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Document);
        });
        
        setDocuments(docs);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.uid, clientId]);

  return { documents, loading, error };
}
