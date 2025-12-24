import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";

// Pages
import OnboardingPage from "@/pages/Onboarding";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import DocumentsPage from "@/pages/Documents";
import UploadPage from "@/pages/Upload";
import SearchPage from "@/pages/Search";
import DocumentViewer from "@/pages/DocumentViewer";
import AutofillPage from "@/pages/Autofill";
import SettingsPage from "@/pages/Settings";
import InstallPage from "@/pages/Install";
import ReferPage from "@/pages/Refer";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          {/* Public routes */}
            <Route path="/" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/install" element={<InstallPage />} />
            
            {/* Protected routes */}
            <Route
              element={
                <AuthGuard>
                  <MainLayout />
                </AuthGuard>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/document/:id" element={<DocumentViewer />} />
              <Route path="/autofill" element={<AutofillPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/refer" element={<ReferPage />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
