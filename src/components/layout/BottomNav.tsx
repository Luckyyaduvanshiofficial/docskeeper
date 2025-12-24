import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/upload', icon: Plus, label: 'Add', isCenter: true },
  { path: '/autofill', icon: Sparkles, label: 'AI' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  // Hide on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 lg:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center py-2 px-3 group"
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                isActive && "bg-primary/10"
              )}>
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                  )} 
                />
              </div>
              <span 
                className={cn(
                  "text-xs mt-0.5 transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
