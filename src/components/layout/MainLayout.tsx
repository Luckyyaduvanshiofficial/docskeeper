import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSheet = () => setSheetOpen(false);

  // Hide sidebar on settings page for mobile-first design
  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - hidden on settings */}
      {!isSettingsPage && (
        <div className="hidden lg:block">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        </div>
      )}
      
      <main className="flex-1 min-w-0">
        {/* Mobile Header with Hamburger Menu */}
        <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar isOpen={true} onToggle={closeSheet} />
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-foreground">DocsKeeper</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
