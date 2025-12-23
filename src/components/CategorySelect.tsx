import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCategories, PREDEFINED_CATEGORIES } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  showManage?: boolean;
  className?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onValueChange,
  showManage = true,
  className,
}) => {
  const { allCategories, customCategories, addCategory, removeCategory, isCustomCategory } = useCategories();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const success = addCategory(newCategoryName);
    if (success) {
      toast({
        title: 'Category added',
        description: `"${newCategoryName}" has been added to your categories.`,
      });
      setNewCategoryName('');
    } else {
      toast({
        title: 'Category exists',
        description: 'This category already exists.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveCategory = (name: string) => {
    const success = removeCategory(name);
    if (success) {
      toast({
        title: 'Category removed',
        description: `"${name}" has been removed.`,
      });
      // If current value was the removed category, reset
      if (value === name) {
        onValueChange('');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`bg-background border-border flex-1 ${className || ''}`}>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {allCategories.map((category) => (
            <SelectItem key={category} value={category}>
              <span className="flex items-center gap-2">
                {category}
                {isCustomCategory(category) && (
                  <Badge variant="secondary" className="text-xs py-0 px-1">
                    Custom
                  </Badge>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showManage && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>
                Add custom categories or manage existing ones.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Add new category */}
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name..."
                  className="bg-background border-border"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                  Add
                </Button>
              </div>

              {/* Predefined categories */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Predefined</p>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <Badge key={cat} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom categories */}
              {customCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Custom</p>
                  <div className="flex flex-wrap gap-2">
                    {customCategories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                        {cat}
                        <button
                          onClick={() => handleRemoveCategory(cat)}
                          className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CategorySelect;
