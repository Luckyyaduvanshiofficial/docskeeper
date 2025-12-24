import { useState, useEffect } from 'react';
import { databaseService } from '@/services/appwrite';
import { useAuth } from '@/context/AuthContext';

interface NotificationBadges {
  documents: number;
  uploads: number;
  search: number;
}

export const useNotificationBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<NotificationBadges>({
    documents: 0,
    uploads: 0,
    search: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      try {
        // Get recent documents count (last 24 hours)
        const result = await databaseService.listDocuments();
        if (result.success && result.data) {
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          const recentDocs = result.data.filter(doc => 
            new Date(doc.uploadedAt) > yesterday
          );

          // Show badge for new documents in last 24h
          const newDocsCount = recentDocs.length;
          
          // Check localStorage for last seen count
          const lastSeenKey = `lastSeenDocCount_${user.$id}`;
          const lastSeenCount = parseInt(localStorage.getItem(lastSeenKey) || '0', 10);
          
          const unseenCount = Math.max(0, result.data.length - lastSeenCount);
          
          setBadges(prev => ({
            ...prev,
            documents: Math.min(unseenCount, 99), // Cap at 99
          }));
        }
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchCounts();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchCounts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const clearBadge = (type: keyof NotificationBadges) => {
    setBadges(prev => ({ ...prev, [type]: 0 }));
    
    if (type === 'documents' && user) {
      // Update last seen count
      databaseService.listDocuments().then(result => {
        if (result.success && result.data) {
          localStorage.setItem(`lastSeenDocCount_${user.$id}`, result.data.length.toString());
        }
      });
    }
  };

  return { badges, clearBadge };
};
