import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import DocumentCard from '@/components/cards/DocumentCard';
import { useAuth } from '@/context/AuthContext';
import { databaseService, DocumentMetadata } from '@/services/appwrite';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Models } from 'appwrite';

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { allCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  
  const [documents, setDocuments] = useState<(DocumentMetadata & Models.Document)[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setHasSearched(true);

    try {
      const result = await databaseService.searchDocuments(
        keyword,
        category !== 'all' ? category : undefined,
        startDate || undefined,
        endDate || undefined
      );

      if (result.success) {
        setDocuments(result.data || []);
      } else {
        toast({
          title: 'Search failed',
          description: result.error || 'Unable to search documents',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong during search',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, keyword, category, startDate, endDate, toast]);

  // Auto-search on mount if URL has params
  useEffect(() => {
    if (searchParams.get('q') || searchParams.get('category')) {
      handleSearch();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL params
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (category !== 'all') params.set('category', category);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    setSearchParams(params);

    handleSearch();
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setSearchParams({});
    setDocuments([]);
    setHasSearched(false);
  };

  const activeFiltersCount = [
    category !== 'all',
    startDate,
    endDate,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Search Documents</h1>
        <p className="text-muted-foreground mt-1">
          Find documents by name, description, or content
        </p>
      </div>

      {/* Search Form */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Keyword Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by filename, description..."
                  className="pl-12 h-12 bg-background border-border"
                />
              </div>

              {/* Category Quick Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-background border-border">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Advanced Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 gap-2 border-border">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {allCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="pl-10 bg-background border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="pl-10 bg-background border-border"
                        />
                      </div>
                    </div>

                    <Button onClick={clearFilters} variant="outline" className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search Button */}
              <Button type="submit" className="h-12 px-8">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : hasSearched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {documents.length} document{documents.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.$id} document={doc} />
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No documents found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Search your documents
            </h3>
            <p className="text-muted-foreground">
              Enter keywords or select filters to find documents
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
