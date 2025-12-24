import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Files, Image, FileText, Search, Upload, FolderOpen, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { databaseService, DocumentMetadata } from '@/services/appwrite';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Models } from 'appwrite';

const categoryIcons = [
  { name: 'Documents', icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { name: 'Images', icon: Image, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  { name: 'All Files', icon: Files, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
];

const quickActions = [
  { label: 'Upload', icon: Upload, path: '/upload', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { label: 'Search', icon: Search, path: '/search', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  { label: 'AI Fill', icon: Sparkles, path: '/autofill', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { allCategories } = useCategories();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  
  const [totalCount, setTotalCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [recentDocs, setRecentDocs] = useState<(DocumentMetadata & Models.Document)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Animated counter effect
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (totalCount > 0) {
      let start = 0;
      const duration = 1000;
      const increment = totalCount / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= totalCount) {
          setDisplayCount(totalCount);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [totalCount]);

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
      'bg-amber-100 dark:bg-amber-900/30',
      'bg-emerald-100 dark:bg-emerald-900/30',
      'bg-blue-100 dark:bg-blue-900/30',
      'bg-pink-100 dark:bg-pink-900/30',
      'bg-purple-100 dark:bg-purple-900/30',
      'bg-orange-100 dark:bg-orange-900/30',
    ];
    return colors[index % colors.length];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 pb-24">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Greeting Section */}
      <div className="animate-fade-in">
        <Card className="border-border bg-gradient-to-br from-primary/10 via-card to-primary/5 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  {getGreeting()}
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.name?.split(' ')[0] || 'User'} 👋
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your documents are safe and organized
                </p>
              </div>
              
              {/* Stylish Document Counter */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {displayCount}
                  </span>
                  <span className="text-[10px] font-medium text-primary-foreground/80 uppercase tracking-wider">
                    {totalCount === 1 ? 'Doc' : 'Docs'}
                  </span>
                </div>
                <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-lg -z-10" />
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((totalCount / 50) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {totalCount}/50 docs
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="animate-fade-in">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search your documents... (press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card border-border rounded-xl shadow-sm transition-shadow hover:shadow-md focus:shadow-md"
          />
        </div>
      </form>

      {/* Quick Actions */}
      <div className="animate-fade-in">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="flex-1 group"
            >
              <Card className="border-border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-95">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Categories */}
      <div className="flex gap-4 justify-center animate-fade-in">
        {categoryIcons.map((cat) => (
          <Link
            key={cat.name}
            to={cat.name === 'All Files' ? '/documents' : `/search?category=${cat.name}`}
            className="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center shadow-sm hover:shadow-md transition-shadow`}>
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
          <Link to="/documents" className="text-sm text-primary font-medium hover:underline">
            See All
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {allCategories.slice(0, 6).map((category, index) => (
            <Link
              key={category}
              to={`/search?category=${encodeURIComponent(category)}`}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Card className="border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-3 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl ${getCategoryColor(index)} flex items-center justify-center mb-2`}>
                    <FolderOpen className="h-6 w-6 text-foreground/70" />
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
          <Link to="/documents" className="text-sm text-primary font-medium hover:underline">
            See All
          </Link>
        </div>
        
        {recentDocs.length > 0 ? (
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0 divide-y divide-border">
              {recentDocs.slice(0, 3).map((doc) => (
                <Link
                  key={doc.$id}
                  to={`/document/${doc.$id}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
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
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Files className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No documents yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by uploading your first document
              </p>
              <Button asChild size="sm">
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-muted-foreground animate-fade-in">
        <span className="hidden sm:inline">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">/</kbd> to search, 
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono ml-1">U</kbd> to upload, 
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono ml-1">?</kbd> for help
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
