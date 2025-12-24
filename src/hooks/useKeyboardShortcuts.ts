import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + K - Quick search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
        toast('Quick search opened', { duration: 1500 });
        return;
      }

      // Ctrl/Cmd + U - Upload
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        navigate('/upload');
        toast('Upload page opened', { duration: 1500 });
        return;
      }

      // "/" - Quick search (without modifier)
      if (e.key === '/') {
        e.preventDefault();
        navigate('/search');
        toast('Quick search opened', { duration: 1500 });
      }

      // "u" - Upload (without modifier)
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        navigate('/upload');
        toast('Upload page opened', { duration: 1500 });
      }

      // "d" - Dashboard
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        navigate('/dashboard');
        toast('Dashboard opened', { duration: 1500 });
      }

      // "?" - Show shortcuts help
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        toast(
          '⌨️ Keyboard Shortcuts\nCtrl+K or / - Search\nCtrl+U or U - Upload\nD - Dashboard',
          { duration: 4000 }
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};
