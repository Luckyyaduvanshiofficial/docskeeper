import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Files, Image, FileText, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { databaseService, DocumentMetadata } from '@/services/appwrite';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Models } from 'appwrite';

const categoryIcons = [
  { name: 'Documents', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { name: 'Images', icon: Image, color: 'bg-pink-100 text-pink-600' },
  { name: 'All Files', icon: Files, color: 'bg-purple-100 text-purple-600' },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { allCategories } = useCategories();
  
  const [totalCount, setTotalCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [recentDocs, setRecentDocs] = useState<(DocumentMetadata & Models.Document)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-amber-100',
      'bg-emerald-100',
      'bg-blue-100',
      'bg-pink-100',
      'bg-purple-100',
      'bg-orange-100',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 pb-24">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">
          Hello, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="animate-fade-in">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your documents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card border-border rounded-xl"
          />
        </div>
      </form>

      {/* Quick Categories */}
      <div className="flex gap-4 justify-center animate-fade-in">
        {categoryIcons.map((cat, index) => (
          <Link
            key={cat.name}
            to={cat.name === 'All Files' ? '/documents' : `/search?category=${cat.name}`}
            className="flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center`}>
              <cat.icon className="h-7 w-7" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* My Collections */}
      <section className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">My Collections</h2>
          <Link to="/documents" className="text-sm text-primary font-medium">
            See All
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {allCategories.slice(0, 6).map((category, index) => (
            <Link
              key={category}
              to={`/search?category=${encodeURIComponent(category)}`}
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <Card className="border-border bg-card overflow-hidden">
                <CardContent className="p-3 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl ${getCategoryColor(index)} flex items-center justify-center mb-2`}>
                    <span className="text-xl">📁</span>
                  </div>
                  <p className="text-xs font-medium text-foreground text-center truncate w-full">
                    {category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {categoryCounts[category] || 0} items
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
          <Link to="/documents" className="text-sm text-primary font-medium">
            See All
          </Link>
        </div>
        
        {recentDocs.length > 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-0 divide-y divide-border">
              {recentDocs.slice(0, 3).map((doc) => (
                <Link
                  key={doc.$id}
                  to={`/document/${doc.$id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center">
              <Files className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No documents yet</p>
              <Link to="/upload" className="text-sm text-primary font-medium mt-2 inline-block">
                Upload your first document
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
