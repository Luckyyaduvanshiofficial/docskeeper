import { useState, useEffect } from 'react';

// Predefined categories that are always available
export const PREDEFINED_CATEGORIES = [
  'Academic',
  'Receipts',
  'ID Proofs',
  'Certificates',
  'Personal',
  'Family',
  'Others',
] as const;

const CUSTOM_CATEGORIES_KEY = 'docskeeper_custom_categories';

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Load custom categories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomCategories(parsed);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // All categories (predefined + custom)
  const allCategories = [...PREDEFINED_CATEGORIES, ...customCategories];

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    
    // Check if already exists (case-insensitive)
    const exists = allCategories.some(
      (cat) => cat.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return false;

    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    return true;
  };

  const removeCategory = (name: string) => {
    // Only allow removing custom categories
    if (PREDEFINED_CATEGORIES.includes(name as any)) return false;

    const updated = customCategories.filter((cat) => cat !== name);
    setCustomCategories(updated);
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    return true;
  };

  const isCustomCategory = (name: string) => {
    return customCategories.includes(name);
  };

  return {
    allCategories,
    predefinedCategories: PREDEFINED_CATEGORIES,
    customCategories,
    addCategory,
    removeCategory,
    isCustomCategory,
  };
}
