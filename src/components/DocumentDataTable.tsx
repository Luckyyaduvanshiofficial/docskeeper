import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Trash2, FolderInput } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { DocumentMetadata } from '@/services/appwrite';
import { cn } from '@/lib/utils';

type DocumentWithId = DocumentMetadata & { $id: string };

type SortField = 'fileName' | 'category' | 'uploadedAt';
type SortDirection = 'asc' | 'desc';

interface DocumentDataTableProps {
  documents: DocumentWithId[];
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDelete: (ids: string[]) => void;
  onMove: (ids: string[]) => void;
  onPreview?: (doc: DocumentWithId) => void;
}

const DocumentDataTable: React.FC<DocumentDataTableProps> = ({
  documents,
  selectedIds,
  isSelectionMode,
  onToggleSelection,
  onSelectAll,
  onDelete,
  onMove,
  onPreview,
}) => {
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'fileName':
        comparison = a.fileName.localeCompare(b.fileName);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'uploadedAt':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const getFileTypeColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {isSelectionMode && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === documents.length && documents.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="w-12"></TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('fileName')}
                className="h-8 px-2 -ml-2 font-medium"
              >
                File Name
                <SortIcon field="fileName" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('category')}
                className="h-8 px-2 -ml-2 font-medium"
              >
                Category
                <SortIcon field="category" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('uploadedAt')}
                className="h-8 px-2 -ml-2 font-medium"
              >
                Date
                <SortIcon field="uploadedAt" />
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDocuments.map((doc) => (
            <TableRow
              key={doc.$id}
              className={cn(
                "group transition-colors",
                selectedIds.has(doc.$id) && "bg-primary/5"
              )}
            >
              {isSelectionMode && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(doc.$id)}
                    onCheckedChange={() => onToggleSelection(doc.$id)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  getFileTypeColor(doc.fileName)
                )}>
                  <FileText className="h-4 w-4" />
                </div>
              </TableCell>
              <TableCell>
                <Link
                  to={`/document/${doc.$id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                >
                  {doc.fileName}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {doc.category}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-xs">
                <p className="text-sm text-muted-foreground truncate">
                  {doc.description || '-'}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem asChild>
                      <Link to={`/document/${doc.$id}`} className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove([doc.$id])} className="gap-2">
                      <FolderInput className="h-4 w-4" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete([doc.$id])}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {sortedDocuments.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No documents found
        </div>
      )}
    </div>
  );
};

export default DocumentDataTable;
