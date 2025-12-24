import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Search,
  Sparkles,
  Settings,
  Share2,
  Moon,
  Sun,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { databaseService, DocumentMetadata } from '@/services/appwrite';
import { Models } from 'appwrite';

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [recentDocs, setRecentDocs] = useState<(DocumentMetadata & Models.Document)[]>([]);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Fetch recent documents for quick access
  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      const result = await databaseService.getRecentDocuments(5);
      if (result.success && result.data) {
        setRecentDocs(result.data);
      }
    };
    if (open) {
      fetchDocs();
    }
  }, [open, user]);

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'p' || e.key === 'k') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const pages = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'All Documents', icon: FileText, path: '/documents' },
    { name: 'Upload Document', icon: Upload, path: '/upload' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'AI Autofill', icon: Sparkles, path: '/autofill' },
    { name: 'Refer Friends', icon: Share2, path: '/refer' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Recent Documents */}
        {recentDocs.length > 0 && (
          <>
            <CommandGroup heading="Recent Documents">
              {recentDocs.map((doc) => (
                <CommandItem
                  key={doc.$id}
                  onSelect={() => runCommand(() => navigate(`/document/${doc.$id}`))}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>{doc.fileName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{doc.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Navigation */}
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.path}
              onSelect={() => runCommand(() => navigate(page.path))}
              className="gap-2"
            >
              <page.icon className="h-4 w-4" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="gap-2"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => logout())}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
