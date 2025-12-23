import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit2, Save, X, FileText, Calendar, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { databaseService, storageService, DOCUMENT_CATEGORIES, DocumentMetadata } from '@/services/appwrite';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime, isImageFile, isPdfFile } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { Models } from 'appwrite';

const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [document, setDocument] = useState<(DocumentMetadata & Models.Document) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editJsonData, setEditJsonData] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        const result = await databaseService.getDocument(id);
        if (result.success && result.data) {
          setDocument(result.data);
          setEditCategory(result.data.category);
          setEditDescription(result.data.description || '');
          setEditJsonData(result.data.jsonData || '{}');
        } else {
          toast({
            title: 'Document not found',
            description: 'The document you are looking for does not exist.',
            variant: 'destructive',
          });
          navigate('/dashboard');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load document',
          variant: 'destructive',
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!id || !document) return;

    setSaving(true);
    try {
      // Validate JSON if provided
      if (editJsonData) {
        try {
          JSON.parse(editJsonData);
        } catch {
          toast({
            title: 'Invalid JSON',
            description: 'Please enter valid JSON data',
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }

      const result = await databaseService.updateDocument(id, {
        category: editCategory,
        description: editDescription,
        jsonData: editJsonData,
      });

      if (result.success) {
        setDocument({
          ...document,
          category: editCategory,
          description: editDescription,
          jsonData: editJsonData,
        });
        setIsEditing(false);
        toast({
          title: 'Saved',
          description: 'Document updated successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!document) return;
    const downloadUrl = storageService.getFileDownload(document.fileId);
    window.open(downloadUrl.toString(), '_blank');
  };

  const cancelEdit = () => {
    if (document) {
      setEditCategory(document.category);
      setEditDescription(document.description || '');
      setEditJsonData(document.jsonData || '{}');
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  const previewUrl = storageService.getFileView(document.fileId).toString();
  const isImage = isImageFile(document.fileName);
  const isPdf = isPdfFile(document.fileName);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground truncate max-w-md">
              {document.fileName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Uploaded {formatDateTime(document.uploadedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={cancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[3/4] bg-background flex items-center justify-center">
              {isImage ? (
                <img
                  src={previewUrl}
                  alt={document.fileName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : isPdf ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title={document.fileName}
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Preview not available for this file type
                  </p>
                  <Button variant="outline" onClick={handleDownload} className="mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </Label>
              {isEditing ? (
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="text-sm">
                  {document.category}
                </Badge>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upload Date
              </Label>
              <p className="text-foreground">{formatDateTime(document.uploadedAt)}</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="bg-background border-border min-h-24"
                />
              ) : (
                <p className="text-foreground">
                  {document.description || <span className="text-muted-foreground">No description</span>}
                </p>
              )}
            </div>

            {/* Extracted Text */}
            {document.extractedText && (
              <div className="space-y-2">
                <Label>Extracted Text</Label>
                <div className="bg-background p-4 max-h-32 overflow-y-auto text-sm text-foreground border border-border">
                  {document.extractedText}
                </div>
              </div>
            )}

            {/* JSON Data */}
            <div className="space-y-2">
              <Label>Extracted Fields (JSON)</Label>
              {isEditing ? (
                <Textarea
                  value={editJsonData}
                  onChange={(e) => setEditJsonData(e.target.value)}
                  placeholder='{"field": "value"}'
                  className="bg-background border-border min-h-32 font-mono text-sm"
                />
              ) : (
                <pre className="bg-background p-4 max-h-48 overflow-y-auto text-sm text-foreground border border-border whitespace-pre-wrap">
                  {document.jsonData ? JSON.stringify(JSON.parse(document.jsonData), null, 2) : '{}'}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentViewer;
