import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, ChevronRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { databaseService, DocumentMetadata } from '@/services/appwrite';
import { useCategories, PREDEFINED_CATEGORIES } from '@/hooks/useCategories';
import { format } from 'date-fns';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<(DocumentMetadata & { $id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { allCategories } = useCategories();

  const fetchDocuments = async () => {
    try {
      const result = await databaseService.listDocuments();
      if (result.success && result.data) {
        setDocuments(result.data as (DocumentMetadata & { $id: string })[]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  // Group documents by category
  const documentsByCategory = allCategories.reduce((acc, category) => {
    acc[category] = documents.filter((doc) => doc.category === category);
    return acc;
  }, {} as Record<string, (DocumentMetadata & { $id: string })[]>);

  // Get uncategorized documents
  const uncategorized = documents.filter(
    (doc) => !doc.category || !allCategories.includes(doc.category)
  );

  // Categories with documents (sorted by count)
  const categoriesWithDocs = allCategories
    .filter((cat) => documentsByCategory[cat]?.length > 0)
    .sort((a, b) => documentsByCategory[b].length - documentsByCategory[a].length);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Documents</h1>
          <p className="text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''} organized by category
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
            <Button asChild>
              <Link to="/upload">Upload Document</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={categoriesWithDocs} className="space-y-4">
          {categoriesWithDocs.map((category) => (
            <AccordionItem key={category} value={category} className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{category}</span>
                  <Badge variant="secondary">
                    {documentsByCategory[category].length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-3">
                  {documentsByCategory[category].map((doc) => (
                    <Link
                      key={doc.$id}
                      to={`/document/${doc.$id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {uncategorized.length > 0 && (
            <AccordionItem value="uncategorized" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Uncategorized</span>
                  <Badge variant="outline">{uncategorized.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-3">
                  {uncategorized.map((doc) => (
                    <Link
                      key={doc.$id}
                      to={`/document/${doc.$id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  );
};

export default Documents;
