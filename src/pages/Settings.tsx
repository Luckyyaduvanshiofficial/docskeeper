import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Download, 
  Cloud, 
  HardDrive, 
  HelpCircle, 
  FileText, 
  Shield,
  LogOut,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
    toast({
      title: newMode ? 'Dark mode enabled' : 'Light mode enabled',
      description: 'Your preference has been saved.',
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dataItems = [
    { icon: Download, label: 'Import / Export', onClick: () => navigate('/documents') },
    { icon: Cloud, label: 'Cloud Backup', onClick: () => toast({ title: 'Coming soon', description: 'Cloud backup will be available soon.' }) },
    { icon: HardDrive, label: 'Used Space', onClick: () => toast({ title: 'Storage', description: 'You are using minimal storage.' }) },
  ];

  const moreItems = [
    { icon: HelpCircle, label: 'Help', onClick: () => toast({ title: 'Help', description: 'Contact support@docskeeper.app' }) },
    { icon: FileText, label: 'Terms & Conditions', onClick: () => toast({ title: 'Terms & Conditions', description: 'View our terms at docskeeper.app/terms' }) },
    { icon: Shield, label: 'Privacy & Policy', onClick: () => toast({ title: 'Privacy Policy', description: 'View our policy at docskeeper.app/privacy' }) },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* User Profile */}
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-105">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{user?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-primary/20' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <span className="font-medium text-foreground">Dark Mode</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        {/* Data Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Data</h2>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-0 divide-y divide-border">
              {dataItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-all hover:pl-5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* More Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground px-1">More</h2>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-0 divide-y divide-border">
              {moreItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-all hover:pl-5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
