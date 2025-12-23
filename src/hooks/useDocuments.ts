import { useState, useEffect, useCallback } from 'react';
import { databaseService, DocumentMetadata } from '@/services/appwrite';
import { useAuth } from '@/context/AuthContext';
import { Models } from 'appwrite';

interface UseDocumentsOptions {
  category?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseDocumentsReturn {
  documents: (DocumentMetadata & Models.Document)[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

export const useDocuments = (options: UseDocumentsOptions = {}): UseDocumentsReturn => {
  const { category, limit, autoFetch = true } = options;
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<(DocumentMetadata & Models.Document)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (category) {
        result = await databaseService.getDocumentsByCategory(category);
      } else if (limit) {
        result = await databaseService.getRecentDocuments(limit);
      } else {
        result = await databaseService.listDocuments();
      }

      if (result.success) {
        setDocuments(result.data || []);
        setTotalCount(result.data?.length || 0);
      } else {
        setError(result.error || 'Failed to fetch documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user, category, limit]);

  useEffect(() => {
    if (autoFetch && user) {
      fetchDocuments();
    }
  }, [autoFetch, user, fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    totalCount,
  };
};
