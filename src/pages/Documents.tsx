import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  Grid3X3,
  List,
  ChevronDown,
  Image,
  Archive,
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { databaseService, storageService, DocumentMetadata } from '@/services/appwrite';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SearchBar from '@/components/forms/SearchBar';
import DocumentsSkeleton from '@/components/skeletons/DocumentsSkeleton';

type DocumentWithId = DocumentMetadata & { $id: string };

// Category icons for browse section - exclude video/audio/recording
const browseCategories = [
  { name: 'Documents', icon: FileText, count: '0' },
  { name: 'Images', icon: Image, count: '0' },
  { name: 'Archive', icon: Archive, count: '0' },
];

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { allCategories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Get document suggestions for search
  const getSearchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (!query.trim()) return [];
    const uniqueNames = [...new Set(documents.map(d => d.fileName))];
    const uniqueCategories = [...new Set(documents.map(d => d.category))];
    return [...uniqueNames, ...uniqueCategories]
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [documents]);

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

  const selectAll = () => {
    if (selectedIds.size === filteredDocuments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDocuments.map(d => d.$id)));
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
        await storageService.deleteFile(doc.fileId);
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

  // Filter documents by search
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.fileName.toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query) ||
      (doc.description && doc.description.toLowerCase().includes(query))
    );
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'oldest':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      default:
        return 0;
    }
  });

  // Group documents by category for grid view
  const documentsByCategory = allCategories.reduce((acc, category) => {
    acc[category] = sortedDocuments.filter((doc) => doc.category === category);
    return acc;
  }, {} as Record<string, DocumentWithId[]>);

  // Get category counts for browse section
  const getCategoryCount = (categoryName: string) => {
    const count = documents.filter(doc => {
      if (categoryName === 'Documents') {
        return doc.fileName.endsWith('.pdf') || doc.fileName.endsWith('.doc') || doc.fileName.endsWith('.docx');
      }
      if (categoryName === 'Images') {
        return doc.fileName.endsWith('.jpg') || doc.fileName.endsWith('.jpeg') || doc.fileName.endsWith('.png') || doc.fileName.endsWith('.gif');
      }
      return true;
    }).length;
    return count.toString();
  };

  if (loading) {
    return <DocumentsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header with User Info */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-4 w-4" />
                    {documents.length} files
                  </span>
                  <span>•</span>
                  <span>{allCategories.length} categories</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browse By Category */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Browse By Category</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {browseCategories.map((cat, index) => (
            <Link
              key={cat.name}
              to={`/search?category=${cat.name}`}
              className={`flex-shrink-0 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                index === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <cat.icon className={`h-6 w-6 mb-2 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-medium ${index === 0 ? 'text-primary' : 'text-foreground'}`}>{cat.name}</p>
              <p className="text-xs text-muted-foreground">{getCategoryCount(cat.name)} Total</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse All Files Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Browse All Files</h2>
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ChevronDown className="h-4 w-4" />
                  {sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'By Name'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>By Name</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by filename, category..."
            onSuggestionsFetch={getSearchSuggestions}
            recentSearches={['Aadhaar', 'Fee Receipt', 'Certificate']}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
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
            Export
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

        {/* Bulk Actions Bar */}
        {isSelectionMode && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-muted rounded-xl border mb-4 animate-fade-in">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedIds.size === filteredDocuments.length ? (
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

        {/* Files Grid/List */}
        {sortedDocuments.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/upload">Upload Document</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map((category) => {
              const categoryDocs = documentsByCategory[category] || [];
              if (categoryDocs.length === 0) return null;
              
              return (
                <Link
                  key={category}
                  to={`/search?category=${encodeURIComponent(category)}`}
                  className="group"
                >
                  <Card className="border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {categoryDocs.length} files
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDocuments.map((doc) => (
              <Card
                key={doc.$id}
                className={`border-border bg-card hover:shadow-md transition-all ${
                  isSelectionMode && selectedIds.has(doc.$id) ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  {isSelectionMode ? (
                    <div
                      onClick={() => toggleDocumentSelection(doc.$id)}
                      className="flex items-center gap-4 cursor-pointer"
                    >
                      <Checkbox checked={selectedIds.has(doc.$id)} />
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.category} • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/document/${doc.$id}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {doc.fileName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doc.category} • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected documents will be permanently deleted.
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
