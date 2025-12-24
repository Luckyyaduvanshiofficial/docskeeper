import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
