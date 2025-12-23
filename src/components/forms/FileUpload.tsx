import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10,
  className,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!allowedTypes.some(type => type === fileExtension || file.type.includes(type.replace('.', '')))) {
      setError(`Invalid file type. Allowed: ${accept}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
    }
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8 text-muted-foreground" />;
    
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-8 w-8 text-destructive" />;
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <Image className="h-8 w-8 text-primary" />;
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed transition-colors p-8",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          selectedFile ? "border-solid bg-card" : "bg-background",
          error && "border-destructive"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          {getFileIcon()}
          
          {selectedFile ? (
            <div className="mt-4">
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="mt-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="font-medium text-foreground">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports: PDF, JPG, PNG (max {maxSize}MB)
              </p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
