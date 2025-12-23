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
          "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border hover:bg-accent/50 transition-colors cursor-pointer",
          className
        )}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 rounded-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate text-sm sm:text-base">{document.fileName}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(document.uploadedAt)}</p>
          </div>
          <Badge variant="secondary" className="flex-shrink-0 text-xs">
            {document.category}
          </Badge>
        </div>
      </Link>
    );
  }

  return (
    <Card className={cn("border-border bg-card overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center flex-shrink-0 rounded-lg">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1 text-sm sm:text-base">
              {document.fileName}
            </h3>
            {document.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                {document.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">{document.category}</Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                {formatDate(document.uploadedAt)}
              </span>
            </div>
          </div>
          <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
            <Link to={`/document/${document.$id}`}>
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
