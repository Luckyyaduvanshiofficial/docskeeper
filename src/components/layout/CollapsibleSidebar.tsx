import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  Sparkles, 
  LogOut,
  FileText,
  Settings,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBadge from '@/components/NotificationBadge';
import { useNotificationBadges } from '@/hooks/useNotificationBadges';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/documents', icon: FileText, label: 'All Documents' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/autofill', icon: Sparkles, label: 'AI Autofill' },
  { path: '/refer', icon: Share2, label: 'Refer Friends' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { badges, clearBadge } = useNotificationBadges();

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const handleLogout = async () => {
    await logout();
  };

  const handleNavClick = (path: string) => {
    if (path === '/documents') {
      clearBadge('documents');
    }
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-border transition-all duration-300",
        isCollapsed ? "justify-center p-3" : "justify-between p-4"
      )}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <img 
            src={logoImage} 
            alt="DocsKeeper" 
            className={cn(
              "rounded-lg object-contain transition-all",
              isCollapsed ? "w-8 h-8" : "w-10 h-10"
            )} 
          />
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-semibold text-foreground text-sm">DocsKeeper</h1>
              <p className="text-[10px] text-muted-foreground">Document Vault</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 py-4 space-y-1", isCollapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = item.path === '/documents' && badges.documents > 0;
          
          const linkContent = (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "relative flex items-center gap-3 text-sm font-medium transition-all duration-200 rounded-lg group",
                isCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5 transition-transform flex-shrink-0",
                  !isActive && "group-hover:scale-110"
                )} />
                {showBadge && <NotificationBadge count={badges.documents} />}
              </div>
              {!isCollapsed && (
                <span className="animate-fade-in truncate">{item.label}</span>
              )}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User section */}
      <div className={cn(
        "border-t border-border",
        isCollapsed ? "p-2" : "p-3 space-y-2"
      )}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium rounded-lg flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <ThemeToggle variant="text" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </>
        ) : (
          <div className="space-y-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-2">
                  <div className="w-8 h-8 bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium rounded-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.name || 'User'}
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle theme</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Ctrl+B</kbd> to collapse
          </p>
        </div>
      )}
    </aside>
  );
};

export default CollapsibleSidebar;
