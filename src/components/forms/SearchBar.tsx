import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, FileText, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggestion';
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  suggestions?: string[];
  recentSearches?: string[];
  onSuggestionsFetch?: (query: string) => Promise<string[]>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search documents...',
  className,
  defaultValue = '',
  suggestions: externalSuggestions = [],
  recentSearches = [],
  onSuggestionsFetch,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Generate suggestions based on query
  useEffect(() => {
    const generateSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        // Show recent searches when no query
        const recentItems: SearchSuggestion[] = recentSearches.slice(0, 5).map((text, i) => ({
          id: `recent-${i}`,
          text,
          type: 'recent' as const,
        }));
        setSuggestions(recentItems);
        return;
      }

      setIsLoading(true);
      
      try {
        let fetchedSuggestions: string[] = [];
        
        if (onSuggestionsFetch) {
          fetchedSuggestions = await onSuggestionsFetch(debouncedQuery);
        }

        // Combine with external suggestions and filter
        const allSuggestions = [...new Set([...fetchedSuggestions, ...externalSuggestions])];
        const filtered = allSuggestions
          .filter(s => s.toLowerCase().includes(debouncedQuery.toLowerCase()))
          .slice(0, 6);

        const suggestionItems: SearchSuggestion[] = filtered.map((text, i) => ({
          id: `suggestion-${i}`,
          text,
          type: 'suggestion' as const,
        }));

        setSuggestions(suggestionItems);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [debouncedQuery, externalSuggestions, recentSearches, onSuggestionsFetch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsOpen(false);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, selectedIndex, handleSelectSuggestion]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-12 pr-20 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" size="sm" className="h-8">
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          <ul className="py-2">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                    index === selectedIndex 
                      ? "bg-accent text-accent-foreground" 
                      : "hover:bg-accent/50"
                  )}
                >
                  {suggestion.type === 'recent' ? (
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm text-foreground truncate">{suggestion.text}</span>
                  {suggestion.type === 'recent' && (
                    <span className="ml-auto text-xs text-muted-foreground">Recent</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
