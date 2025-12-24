import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import onboarding1 from '@/assets/onboarding-1.png';
import onboarding2 from '@/assets/onboarding-2.png';
import onboarding3 from '@/assets/onboarding-3.png';

interface OnboardingSlide {
  image: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    image: onboarding1,
    title: 'Simple way to Manage',
    description: 'Create, save, manage your documents, images, IDs - all documents just in one app.',
  },
  {
    image: onboarding2,
    title: 'Organize is easy',
    description: 'Say no to mess with grouped folders, add your tags, or just search with advanced filters.',
  },
  {
    image: onboarding3,
    title: 'Safe and Secure',
    description: 'We believe privacy is a right. We won\'t sell your data, no ads, ever.',
  },
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { tab: 'login' } });
  };

  const handleRegister = () => {
    navigate('/login', { state: { tab: 'register' } });
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Logo Header */}
      <div className="flex items-center gap-2 p-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">DocsKeeper</span>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Image */}
        <div className="w-64 h-64 mb-8 flex items-center justify-center">
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-3">
          {slides[currentSlide].title}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-center text-sm max-w-xs">
          {slides[currentSlide].description}
        </p>

        {/* Pagination Dots */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 space-y-3">
        <Button
          variant="outline"
          className="w-full h-12 text-base border-primary text-primary hover:bg-primary/5"
          onClick={handleLogin}
        >
          Log In
        </Button>
        
        <Button
          className="w-full h-12 text-base"
          onClick={handleRegister}
        >
          Register
        </Button>

        <button
          onClick={handleSkip}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Just skip for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
