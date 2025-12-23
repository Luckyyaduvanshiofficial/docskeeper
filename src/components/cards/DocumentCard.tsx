import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Calendar } from 'lucide-react';
import { DocumentMetadata } from '@/services/appwrite';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  document: DocumentMetadata & { $id: string };
  variant?: 'default' | 'compact';
  className?: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  variant = 'default',
  className 
}) => {
  if (variant === 'compact') {
    return (
      <Link to={`/document/${document.$id}`}>
        <div className={cn(
          "flex items-center gap-4 p-4 bg-card border border-border hover:bg-accent/50 transition-colors cursor-pointer",
          className
        )}>
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{document.fileName}</p>
            <p className="text-sm text-muted-foreground">{formatDate(document.uploadedAt)}</p>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {document.category}
          </Badge>
        </div>
      </Link>
    );
  }

  return (
    <Card className={cn("border-border bg-card overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1">
              {document.fileName}
            </h3>
            {document.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {document.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline">{document.category}</Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(document.uploadedAt)}
              </span>
            </div>
          </div>
          <Button asChild variant="ghost" size="icon">
            <Link to={`/document/${document.$id}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
