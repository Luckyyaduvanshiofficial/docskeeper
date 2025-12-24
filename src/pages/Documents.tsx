import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FolderOpen, 
  ChevronRight, 
  RefreshCw, 
  Trash2, 
  FolderInput, 
  Download, 
  CheckSquare, 
  Square,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { databaseService, storageService, DocumentMetadata } from '@/services/appwrite';
import { useCategories } from '@/hooks/useCategories';
import { format } from 'date-fns';
import { toast } from 'sonner';

type DocumentWithId = DocumentMetadata & { $id: string };

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { allCategories } = useCategories();
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Dialogs state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDocuments = async () => {
    try {
      const result = await databaseService.listDocuments();
      if (result.success && result.data) {
        setDocuments(result.data as DocumentWithId[]);
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

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleDocumentSelection = (docId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedIds(newSelected);
  };

  const selectAllInCategory = (categoryDocs: DocumentWithId[]) => {
    const newSelected = new Set(selectedIds);
    const allSelected = categoryDocs.every(doc => selectedIds.has(doc.$id));
    
    if (allSelected) {
      categoryDocs.forEach(doc => newSelected.delete(doc.$id));
    } else {
      categoryDocs.forEach(doc => newSelected.add(doc.$id));
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map(d => d.$id)));
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const docId of selectedIds) {
      const doc = documents.find(d => d.$id === docId);
      if (!doc) continue;

      try {
        // Delete file from storage
        await storageService.deleteFile(doc.fileId);
        // Delete metadata from database
        const result = await databaseService.deleteDocument(docId);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setIsProcessing(false);
    setShowDeleteDialog(false);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    
    if (successCount > 0) {
      toast.success(`Deleted ${successCount} document${successCount !== 1 ? 's' : ''}`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} document${errorCount !== 1 ? 's' : ''}`);
    }
    
    fetchDocuments();
  };

  const handleBulkMove = async () => {
    if (!targetCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const docId of selectedIds) {
      try {
        const result = await databaseService.updateDocument(docId, { category: targetCategory });
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setIsProcessing(false);
    setShowMoveDialog(false);
    setTargetCategory('');
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    
    if (successCount > 0) {
      toast.success(`Moved ${successCount} document${successCount !== 1 ? 's' : ''} to ${targetCategory}`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to move ${errorCount} document${errorCount !== 1 ? 's' : ''}`);
    }
    
    fetchDocuments();
  };

  const handleExportAll = () => {
    const exportData = documents.map(doc => ({
      fileName: doc.fileName,
      category: doc.category,
      description: doc.description,
      uploadedAt: doc.uploadedAt,
      extractedText: doc.extractedText || '',
      jsonData: doc.jsonData || '',
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${documents.length} documents`);
  };

  const handleExportCSV = () => {
    const headers = ['File Name', 'Category', 'Description', 'Uploaded At'];
    const rows = documents.map(doc => [
      doc.fileName,
      doc.category,
      doc.description,
      format(new Date(doc.uploadedAt), 'yyyy-MM-dd HH:mm:ss'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${documents.length} documents as CSV`);
  };

  // Group documents by category
  const documentsByCategory = allCategories.reduce((acc, category) => {
    acc[category] = documents.filter((doc) => doc.category === category);
    return acc;
  }, {} as Record<string, DocumentWithId[]>);

  // Get uncategorized documents
  const uncategorized = documents.filter(
    (doc) => !doc.category || !allCategories.includes(doc.category)
  );

  // Categories with documents (sorted by count)
  const categoriesWithDocs = allCategories
    .filter((cat) => documentsByCategory[cat]?.length > 0)
    .sort((a, b) => documentsByCategory[b].length - documentsByCategory[a].length);

  const renderDocumentRow = (doc: DocumentWithId) => {
    const isSelected = selectedIds.has(doc.$id);
    
    if (isSelectionMode) {
      return (
        <div
          key={doc.$id}
          onClick={() => toggleDocumentSelection(doc.$id)}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            isSelected 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:bg-accent'
          }`}
        >
          <Checkbox checked={isSelected} />
          <FileText className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{doc.fileName}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      );
    }

    return (
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
    );
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Documents</h1>
          <p className="text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''} organized by category
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={documents.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={documents.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant={isSelectionMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleSelectionMode}
            disabled={documents.length === 0}
          >
            {isSelectionMode ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isSelectionMode && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted rounded-lg border">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selectedIds.size === documents.length ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMoveDialog(true)}
            disabled={selectedIds.size === 0}
          >
            <FolderInput className="h-4 w-4 mr-2" />
            Move
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={selectedIds.size === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

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
          {categoriesWithDocs.map((category) => {
            const categoryDocs = documentsByCategory[category];
            const allCategorySelected = categoryDocs.every(doc => selectedIds.has(doc.$id));
            
            return (
              <AccordionItem key={category} value={category} className="border rounded-lg bg-card">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    {isSelectionMode && (
                      <Checkbox
                        checked={allCategorySelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInCategory(categoryDocs);
                        }}
                      />
                    )}
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{category}</span>
                    <Badge variant="secondary">{categoryDocs.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid gap-3">
                    {categoryDocs.map(renderDocumentRow)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {uncategorized.length > 0 && (
            <AccordionItem value="uncategorized" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {isSelectionMode && (
                    <Checkbox
                      checked={uncategorized.every(doc => selectedIds.has(doc.$id))}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllInCategory(uncategorized);
                      }}
                    />
                  )}
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Uncategorized</span>
                  <Badge variant="outline">{uncategorized.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-3">
                  {uncategorized.map(renderDocumentRow)}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected documents and their files will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Select the category to move the selected documents to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={targetCategory} onValueChange={setTargetCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBulkMove} disabled={isProcessing || !targetCategory}>
              {isProcessing ? 'Moving...' : 'Move'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
