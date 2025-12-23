import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FileUpload from '@/components/forms/FileUpload';
import CategorySelect from '@/components/CategorySelect';
import { useAuth } from '@/context/AuthContext';
import { storageService, databaseService } from '@/services/appwrite';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const uploadSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { category: '', description: '' },
  });

  const handleSubmit = async (data: UploadFormData) => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to upload documents',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      // Upload file to storage
      setProgress(40);
      const uploadResult = await storageService.uploadFile(file);
      
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setProgress(70);

      // Create metadata document
      const metadataResult = await databaseService.createDocument(
        {
          fileId: uploadResult.data.$id,
          fileName: file.name,
          category: data.category,
          description: data.description || '',
          uploadedAt: new Date().toISOString(),
        },
        user.$id
      );

      if (!metadataResult.success) {
        // Cleanup: delete the uploaded file if metadata creation fails
        await storageService.deleteFile(uploadResult.data.$id);
        throw new Error(metadataResult.error || 'Failed to save metadata');
      }

      setProgress(100);

      toast({
        title: 'Upload successful!',
        description: `${file.name} has been uploaded successfully.`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Add a new document to your collection. Supported formats: PDF, JPG, PNG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>File</Label>
              <FileUpload
                onFileSelect={setFile}
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <CategorySelect
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value)}
                showManage={true}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for this document..."
                {...form.register('description')}
                className="bg-background border-border min-h-24"
              />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-foreground font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
