import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Loader2, 
  Upload, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  Brain,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/forms/FileUpload';
import CategorySelect from '@/components/CategorySelect';
import { useAuth } from '@/context/AuthContext';
import { storageService, databaseService } from '@/services/appwrite';
import { geminiService } from '@/services/gemini';
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
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<{
    keywords: string[];
    confidence: number;
  } | null>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { category: '', description: '' },
  });

  // AI-powered document analysis when file is selected
  const handleFileSelect = async (selectedFile: File | null) => {
    setFile(selectedFile);
    setAiAnalysis(null);
    
    if (selectedFile) {
      setAnalyzing(true);
      
      try {
        // Use Gemini AI to analyze the document
        const analysis = await geminiService.analyzeDocument(
          selectedFile.name,
          selectedFile.type
        );
        
        form.setValue('description', analysis.description);
        form.setValue('category', analysis.category);
        setAiAnalysis({
          keywords: analysis.keywords,
          confidence: analysis.confidence,
        });
        
        toast({
          title: 'AI Analysis Complete',
          description: `Document analyzed with ${Math.round(analysis.confidence * 100)}% confidence`,
        });
      } catch (error) {
        console.error('AI analysis failed:', error);
        // Fallback to basic filename parsing
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        form.setValue('description', baseName);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleEnhanceDescription = async () => {
    if (!file) return;
    
    const currentDescription = form.getValues('description') || '';
    setAnalyzing(true);
    
    try {
      const enhanced = await geminiService.enhanceDescription(
        file.name,
        currentDescription
      );
      form.setValue('description', enhanced);
      toast({
        title: 'Description Enhanced',
        description: 'AI has improved your document description',
      });
    } catch (error) {
      toast({
        title: 'Enhancement failed',
        description: 'Could not enhance description',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

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
      const uploadResult = await storageService.uploadFile(file, user.$id);
      
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

  const getFileIcon = () => {
    if (!file) return null;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-5 w-5" />;
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <ImageIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="mb-2">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 mb-4 rounded-2xl">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Upload your documents and let AI automatically analyze and categorize them
        </p>
      </div>

      <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Upload
          </CardTitle>
          <CardDescription>
            Supported formats: PDF, JPG, PNG (Max 10MB) • AI will analyze your document automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Select File
                {analyzing && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analyzing...
                  </Badge>
                )}
              </Label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10}
              />
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">AI Analysis Results</span>
                  <Badge variant="outline" className="ml-auto">
                    {Math.round(aiAnalysis.confidence * 100)}% confidence
                  </Badge>
                </div>
                {aiAnalysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                Category
                {aiAnalysis && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </Label>
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

            {/* Description with AI Enhancement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="flex items-center gap-2">
                  Description
                  {aiAnalysis && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </Label>
                {file && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEnhanceDescription}
                    disabled={analyzing}
                    className="text-xs h-7"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Enhance with AI
                  </Button>
                )}
              </div>
              <Textarea
                id="description"
                placeholder="AI will generate a description, or you can type your own..."
                {...form.register('description')}
                className="bg-background border-border min-h-24"
              />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progress < 40 ? 'Preparing upload...' : 
                     progress < 70 ? 'Uploading file...' : 
                     progress < 100 ? 'Saving metadata...' : 'Complete!'}
                  </span>
                  <span className="text-foreground font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all"
              size="lg"
              disabled={uploading || !file || analyzing}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : analyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing...
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

      {/* Tips Card */}
      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary/20 flex items-center justify-center flex-shrink-0 rounded-xl">
              <Sparkles className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">AI-Powered Features</h3>
              <p className="text-sm text-muted-foreground">
                Our AI uses Gemini 2.0 Flash to automatically analyze your documents, 
                suggest categories, extract keywords, and generate descriptions. 
                The more documents you upload, the smarter your autofill becomes!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
