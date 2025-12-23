import React, { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { autofillService } from '@/services/appwrite';
import { useToast } from '@/hooks/use-toast';

const FORM_TYPES = [
  { value: 'Exam', label: 'Exam Application' },
  { value: 'Scholarship', label: 'Scholarship Application' },
  { value: 'Internship', label: 'Internship Application' },
  { value: 'Admission', label: 'Admission Form' },
  { value: 'Custom', label: 'Custom Form' },
];

const AutofillPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formType, setFormType] = useState('');
  const [autofillData, setAutofillData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      const result = await autofillService.generateAutofill(formType);
      
      if (result.success && result.data) {
        setAutofillData(result.data);
        toast({
          title: 'Autofill generated',
          description: 'Your form data has been prepared based on your documents',
        });
      } else {
        toast({
          title: 'Generation failed',
          description: result.error || 'Could not generate autofill data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong while generating autofill data',
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">AI Autofill Assistant</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Automatically fill forms using data extracted from your stored documents. 
          Select a form type and let AI do the work.
        </p>
      </div>

      {/* Form Selection */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Generate Autofill Data</CardTitle>
          <CardDescription>
            Choose the type of form you want to fill out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Form Type</Label>
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                {FORM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !formType}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Autofill Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {autofillData && (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Autofill Results</CardTitle>
              <CardDescription>
                Data extracted from your documents for {FORM_TYPES.find(t => t.value === formType)?.label}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleCopyAll}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(autofillData).map(([field, value]) => (
                  <TableRow key={field}>
                    <TableCell className="font-medium text-foreground">
                      {field}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {value || <span className="text-muted-foreground italic">Not found</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Improve Your Results</h3>
              <p className="text-sm text-muted-foreground">
                The more documents you upload with properly tagged metadata and extracted fields, 
                the more accurate your autofill suggestions will be. Upload ID proofs, certificates, 
                and academic documents to get the best results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutofillPage;
