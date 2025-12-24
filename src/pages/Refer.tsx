import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Gift, MessageCircle, Mail, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const ReferPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Generate a unique referral link (in production, this would come from backend)
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
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Share DocsKeeper</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Love using DocsKeeper? Share it with your family and friends!
        </p>
      </div>

      {/* Referral Link Card */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with anyone you'd like to invite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="bg-muted font-mono text-sm"
            />
            <Button onClick={copyToClipboard} variant="outline" className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Native Share Button (Mobile) */}
          <Button 
            onClick={shareNative} 
            className="w-full gap-2"
            size="lg"
          >
            <Share2 className="w-4 h-4" />
            Share Now
          </Button>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Share via</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4 hover:bg-green-500/10 hover:border-green-500 hover:text-green-600 transition-all"
              onClick={() => shareVia('whatsapp')}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-600 transition-all"
              onClick={() => shareVia('telegram')}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">Telegram</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4 hover:bg-sky-500/10 hover:border-sky-500 hover:text-sky-600 transition-all"
              onClick={() => shareVia('twitter')}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-600 transition-all"
              onClick={() => shareVia('email')}
            >
              <Mail className="w-6 h-6" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Why Share */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Why Share DocsKeeper?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Help them stay organized</p>
                <p className="text-sm text-muted-foreground">No more searching for important documents</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Keep documents secure</p>
                <p className="text-sm text-muted-foreground">Encrypted storage for peace of mind</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Access anywhere</p>
                <p className="text-sm text-muted-foreground">Works on mobile, tablet, and desktop</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Your Referral Code</p>
            <div className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-lg">
              <QrCode className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold font-mono text-foreground">{referralCode}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferPage;
