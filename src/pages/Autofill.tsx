import React, { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, FileText, Brain, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { databaseService } from '@/services/appwrite';
import { geminiService } from '@/services/gemini';
import { useToast } from '@/hooks/use-toast';

const FORM_TYPES = [
  { value: 'Exam', label: 'Exam Application', icon: '📝', description: 'Competitive exams, entrance tests' },
  { value: 'Scholarship', label: 'Scholarship Application', icon: '🎓', description: 'Financial aid, merit scholarships' },
  { value: 'Internship', label: 'Internship Application', icon: '💼', description: 'Internship & job applications' },
  { value: 'Admission', label: 'Admission Form', icon: '🏫', description: 'College & university admissions' },
  { value: 'Custom', label: 'Custom Form', icon: '📋', description: 'Any other application form' },
];

const AutofillPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formType, setFormType] = useState('');
  const [autofillData, setAutofillData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);

  const handleGenerate = async () => {
    if (!formType) {
      toast({
        title: 'Select form type',
        description: 'Please select a form type to generate autofill data',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to use this feature',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setAutofillData(null);

    try {
      // Fetch user's documents from Appwrite
      const docsResult = await databaseService.listDocuments();
      
      if (!docsResult.success || !docsResult.data) {
        throw new Error('Failed to fetch documents');
      }

      const documents = (docsResult.data || []).map((doc: any) => ({
        fileName: doc.fileName,
        category: doc.category,
        description: doc.description,
      }));

      setDocumentCount(documents.length);

      // Use Gemini AI to generate autofill data
      const result = await geminiService.generateAutofillData(formType, documents);
      
      setAutofillData(result);
      toast({
        title: 'Autofill generated',
        description: `AI analyzed ${documents.length} documents to fill your form`,
      });
    } catch (error) {
      console.error('Autofill generation error:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Could not generate autofill data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!autofillData) return;

    const text = Object.entries(autofillData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'All autofill data has been copied to your clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleCopyField = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: 'Copied!',
        description: `${field} copied to clipboard`,
      });
    } catch {
      toast({
        title: 'Copy failed',
        variant: 'destructive',
      });
    }
  };

  const selectedFormType = FORM_TYPES.find(t => t.value === formType);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 mb-4 rounded-2xl">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">AI Autofill Assistant</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Powered by Gemini AI to automatically extract and fill form data from your documents
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Gemini 2.0 Flash
          </Badge>
          <Badge variant="secondary">Real-time Analysis</Badge>
        </div>
      </div>

      {/* Form Type Selection Grid */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Select Form Type
          </CardTitle>
          <CardDescription>
            Choose the type of form you're filling out for optimized field suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FORM_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFormType(type.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  formType === type.value
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-foreground">{type.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
              </button>
            ))}
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !formType}
            className="w-full shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is analyzing your documents...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Autofill Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {autofillData && (
        <Card className="border-border bg-card shadow-sm animate-fade-in">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Autofill Results
              </CardTitle>
              <CardDescription>
                {selectedFormType?.label} • Analyzed {documentCount} documents
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerate}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleCopyAll}
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Field</TableHead>
                    <TableHead className="font-semibold">Value</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(autofillData).map(([field, value]) => (
                    <TableRow key={field} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {field}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {value?.startsWith('[') ? (
                          <span className="text-muted-foreground italic">{value}</span>
                        ) : (
                          value || <span className="text-muted-foreground italic">Not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyField(field, value)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary/20 flex items-center justify-center flex-shrink-0 rounded-xl">
              <FileText className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Improve Your Results</h3>
              <p className="text-sm text-muted-foreground">
                Upload more documents with clear descriptions for better autofill accuracy.
                The AI analyzes your ID proofs, certificates, academic records, and other documents
                to extract relevant information for your forms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutofillPage;
