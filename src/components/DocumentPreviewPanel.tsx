import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, X, ExternalLink, Download, Trash2, FolderInput, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { DocumentMetadata, storageService } from '@/services/appwrite';
import { cn } from '@/lib/utils';

type DocumentWithId = DocumentMetadata & { $id: string };

interface DocumentPreviewPanelProps {
  document: DocumentWithId | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onMove: (id: string) => void;
}

const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({
  document,
  onClose,
  onDelete,
  onMove,
}) => {
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border border-border">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">No document selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a document to preview its details
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    try {
      const downloadUrl = storageService.getFileDownload(document.fileId);
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const fileExt = document.fileName.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '');

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground truncate flex-1">Preview</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 overflow-auto">
        {/* File Icon/Thumbnail */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
          {isImage ? (
            <img
              src={storageService.getFilePreview(document.fileId)}
              alt={document.fileName}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <Badge variant="secondary">{fileExt?.toUpperCase()}</Badge>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-1 break-all">
              {document.fileName}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(document.uploadedAt), 'MMMM d, yyyy')}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{document.category}</Badge>
            </div>

            {document.description && (
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Description</p>
                <p className="text-sm text-foreground">{document.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button asChild className="w-full">
          <Link to={`/document/${document.$id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Document
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onMove(document.$id)}>
            <FolderInput className="mr-2 h-4 w-4" />
            Move
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(document.$id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewPanel;
