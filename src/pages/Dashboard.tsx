import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Files, Upload, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryCard from '@/components/cards/CategoryCard';
import DocumentCard from '@/components/cards/DocumentCard';
import StatCard from '@/components/cards/StatCard';
import SearchBar from '@/components/forms/SearchBar';
import { useAuth } from '@/context/AuthContext';
import { databaseService, DOCUMENT_CATEGORIES, DocumentMetadata } from '@/services/appwrite';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Models } from 'appwrite';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [totalCount, setTotalCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [recentDocs, setRecentDocs] = useState<(DocumentMetadata & Models.Document)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [totalResult, categoryResult, recentResult] = await Promise.all([
          databaseService.getTotalCount(),
          databaseService.getCategoryCounts(),
          databaseService.getRecentDocuments(5),
        ]);

        if (totalResult.success) setTotalCount(totalResult.data || 0);
        if (categoryResult.success) setCategoryCounts(categoryResult.data || {});
        if (recentResult.success) setRecentDocs(recentResult.data || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full md:w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your documents securely
          </p>
        </div>
        <SearchBar 
          onSearch={handleSearch} 
          className="w-full md:w-96"
          placeholder="Search all documents..."
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Documents"
          value={totalCount}
          icon={Files}
          description="Across all categories"
        />
        <StatCard
          title="Categories"
          value={DOCUMENT_CATEGORIES.length}
          icon={Clock}
          description="Organized collections"
        />
        <Link to="/upload" className="block">
          <Card className="border-border bg-primary text-primary-foreground h-full hover:opacity-90 transition-opacity cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-foreground/20 flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Upload New</p>
                <p className="text-primary-foreground/80 text-sm">Add a document</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Categories</h2>
          <Button variant="ghost" asChild>
            <Link to="/search">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {DOCUMENT_CATEGORIES.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              count={categoryCounts[category] || 0}
            />
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Documents</h2>
          <Button variant="ghost" asChild>
            <Link to="/search">View All</Link>
          </Button>
        </div>
        
        {recentDocs.length > 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-0 divide-y divide-border">
              {recentDocs.map((doc) => (
                <DocumentCard
                  key={doc.$id}
                  document={doc}
                  variant="compact"
                />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="p-12 text-center">
              <Files className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started
              </p>
              <Button asChild>
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
