import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Gift, MessageCircle, Mail, QrCode, Sparkles, Heart, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const ReferPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const referralCode = user?.email?.split('@')[0]?.toUpperCase() || 'DOCSKEEPER';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with your family and friends",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareVia = (platform: string) => {
    const message = `Check out DocsKeeper - the best app to organize and manage all your documents securely! 📄✨ ${referralLink}`;
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Check out DocsKeeper - organize your documents securely!')}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      email: `mailto:?subject=${encodeURIComponent('Try DocsKeeper - Document Management Made Easy')}&body=${encodeURIComponent(message)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DocsKeeper - Document Management',
          text: 'Check out DocsKeeper - the best app to organize and manage all your documents securely!',
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Animated Header with Gradient */}
      <div className="relative text-center space-y-4 py-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden animate-fade-in">
        {/* Decorative background elements */}
        <div className="absolute top-4 left-8 w-16 h-16 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-4 right-8 w-20 h-20 bg-primary/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl shadow-lg mb-2 animate-scale-in">
          <Gift className="w-10 h-10 text-primary-foreground" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
        </div>
        <h1 className="relative text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Share the Love
        </h1>
        <p className="relative text-muted-foreground max-w-md mx-auto px-4">
          Invite friends & family to experience organized document management
        </p>
      </div>

      {/* Referral Link Card - Enhanced */}
      <Card className="shadow-xl border-primary/20 rounded-2xl overflow-hidden animate-fade-in bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this unique link with anyone you'd like to invite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="bg-muted/50 font-mono text-sm rounded-xl border-border/50"
            />
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className={`shrink-0 rounded-xl transition-all duration-300 ${copied ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button 
            onClick={shareNative} 
            className="w-full gap-2 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary/80"
            size="lg"
          >
            <Send className="w-5 h-5" />
            Share Now
          </Button>
        </CardContent>
      </Card>

      {/* Share Options - Enhanced with animations */}
      <Card className="rounded-2xl border-border/50 animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Share via</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-5 rounded-xl border-border/50 hover:bg-[hsl(142,70%,45%)]/10 hover:border-[hsl(142,70%,45%)] hover:text-[hsl(142,70%,45%)] transition-all duration-300 hover:scale-105 hover:shadow-md group"
              onClick={() => shareVia('whatsapp')}
            >
              <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-5 rounded-xl border-border/50 hover:bg-[hsl(200,70%,50%)]/10 hover:border-[hsl(200,70%,50%)] hover:text-[hsl(200,70%,50%)] transition-all duration-300 hover:scale-105 hover:shadow-md group"
              onClick={() => shareVia('telegram')}
            >
              <Send className="w-7 h-7 transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium">Telegram</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-5 rounded-xl border-border/50 hover:bg-[hsl(203,89%,53%)]/10 hover:border-[hsl(203,89%,53%)] hover:text-[hsl(203,89%,53%)] transition-all duration-300 hover:scale-105 hover:shadow-md group"
              onClick={() => shareVia('twitter')}
            >
              <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-5 rounded-xl border-border/50 hover:bg-[hsl(25,95%,53%)]/10 hover:border-[hsl(25,95%,53%)] hover:text-[hsl(25,95%,53%)] transition-all duration-300 hover:scale-105 hover:shadow-md group"
              onClick={() => shareVia('email')}
            >
              <Mail className="w-7 h-7 transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why Share - Enhanced with gradient and animations */}
      <Card className="rounded-2xl overflow-hidden animate-fade-in relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            Why Share DocsKeeper?
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ul className="space-y-4">
            {[
              { num: '1', title: 'Help them stay organized', desc: 'No more searching for important documents' },
              { num: '2', title: 'Keep documents secure', desc: 'Encrypted storage for peace of mind' },
              { num: '3', title: 'Access anywhere', desc: 'Works on mobile, tablet, and desktop' },
            ].map((item, index) => (
              <li 
                key={item.num}
                className="flex items-start gap-4 p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-300 hover:shadow-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-primary-foreground text-sm font-bold">{item.num}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Referral Code - Enhanced */}
      <Card className="rounded-2xl overflow-hidden animate-fade-in">
        <CardContent className="pt-6 pb-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">Your Unique Referral Code</p>
            <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-4 rounded-2xl border border-primary/20">
              <QrCode className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold font-mono bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {referralCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Share this code with friends</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferPage;
