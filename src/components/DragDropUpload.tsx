import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DragDropUploadProps {
  children: React.ReactNode;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter for valid file types
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '');
    });

    if (validFiles.length === 0) {
      toast.error('Invalid file type', {
        description: 'Please upload PDF, JPG, or PNG files only',
      });
      return;
    }

    // Store file info in sessionStorage and navigate to upload page
    const fileInfo = {
      name: validFiles[0].name,
      type: validFiles[0].type,
      size: validFiles[0].size,
    };
    
    // We can't pass the actual File object, so we'll use a different approach
    // Store the file in a global variable temporarily
    (window as any).__pendingUploadFile = validFiles[0];
    
    toast.success(`File ready: ${validFiles[0].name}`, {
      description: 'Redirecting to upload page...',
    });

    navigate('/upload', { state: { droppedFile: true } });
  }, [navigate]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative min-h-full"
    >
      {children}
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-card border-2 border-dashed border-primary rounded-2xl p-12 text-center max-w-md mx-4 shadow-2xl">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Drop to Upload
            </h2>
            <p className="text-muted-foreground">
              Release to upload your document
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Supported: PDF, JPG, PNG (Max 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;
