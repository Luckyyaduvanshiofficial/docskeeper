import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  Sparkles, 
  LogOut,
  FileText,
  Menu,
  X,
  Settings,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface SidebarProps {
  isOpen: boolean;
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="DocsKeeper" className="w-10 h-10 rounded-lg object-contain" />
              <div>
                <h1 className="font-semibold text-foreground">DocsKeeper</h1>
                <p className="text-xs text-muted-foreground">Your Personal Document Vault</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium">
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
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="fixed top-3 left-3 z-30 lg:hidden bg-background shadow-md"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};

export default Sidebar;
