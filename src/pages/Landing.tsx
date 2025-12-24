import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  FolderOpen, 
  Smartphone, 
  Zap,
  ArrowRight,
  Check,
  Lock,
  Eye,
  Server,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logoImage from '@/assets/logo.png';

const features = [
  {
    icon: FolderOpen,
    title: 'Smart Organization',
    description: 'Organize documents with predefined and custom categories tailored to your needs.',
  },
  {
    icon: Search,
    title: 'Instant Search',
    description: 'Find any document in seconds with powerful search and filter options.',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Your documents are encrypted and protected with enterprise-grade security.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Access your documents anywhere with our mobile-optimized interface.',
  },
  {
    icon: Zap,
    title: 'AI Autofill',
    description: 'Extract data from documents to auto-fill forms instantly with AI.',
  },
  {
    icon: FileText,
    title: 'Multi-Format Support',
    description: 'Upload PDFs, images, and documents in various formats.',
  },
];

const benefits = [
  'Unlimited document storage',
  'Personal & Family categories',
  'Secure cloud backup',
  'Works offline with PWA',
  'Export anytime',
];

const trustBadges = [
  { icon: Lock, label: 'AES-256 Encryption', description: 'Military-grade security' },
  { icon: Server, label: 'Secure Cloud', description: 'Your data, protected' },
  { icon: Eye, label: 'Privacy First', description: 'We never sell your data' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="DocsKeeper" className="w-10 h-10 rounded-lg object-contain" />
            <div>
              <span className="text-xl font-bold text-foreground">DocsKeeper</span>
              <p className="text-[10px] text-muted-foreground leading-none">Your Personal Document Vault</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              Trusted by 10,000+ users worldwide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in">
              Your Personal{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Document Vault</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Store, organize, and access all your important documents in one secure place. 
              Perfect for personal, family, and professional use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" asChild className="text-base h-12 px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <Link to="/login">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-12 px-8 hover:shadow-md transition-all">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3 animate-fade-in">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <badge.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="bg-muted/50 border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why people love DocsKeeper
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make document management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="border-border bg-card max-w-3xl mx-auto shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to get organized?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of users who trust DocsKeeper to manage their important documents securely.
              </p>
              <Button size="lg" asChild className="text-base h-12 px-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                <Link to="/login">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="DocsKeeper" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-semibold text-foreground">DocsKeeper</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DocsKeeper. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
