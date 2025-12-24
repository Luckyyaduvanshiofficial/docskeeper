import React, { useState, useEffect } from 'react';
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

const ONBOARDING_KEY = 'docskeeper_onboarding_completed';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Check if onboarding was already completed
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (completed === 'true') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const minSwipeDistance = 50;

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    
    setSlideDirection(index > currentSlide ? 'left' : 'right');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => {
        setIsAnimating(false);
        setSlideDirection(null);
      }, 300);
    }, 150);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleLogin = () => {
    completeOnboarding();
    navigate('/login', { state: { tab: 'login' } });
  };

  const handleRegister = () => {
    completeOnboarding();
    navigate('/login', { state: { tab: 'register' } });
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/login');
  };

  const getSlideClasses = () => {
    if (!isAnimating) return 'opacity-100 translate-x-0';
    
    if (slideDirection === 'left') {
      return 'opacity-0 -translate-x-8';
    } else if (slideDirection === 'right') {
      return 'opacity-0 translate-x-8';
    }
    return 'opacity-100 translate-x-0';
  };

  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Logo Header */}
      <div className="flex items-center gap-2 p-6 animate-fade-in">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">DocsKeeper</span>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
        {/* Image */}
        <div 
          className={`w-64 h-64 mb-8 flex items-center justify-center transition-all duration-300 ease-out ${getSlideClasses()}`}
        >
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 
          className={`text-2xl font-bold text-foreground text-center mb-3 transition-all duration-300 ease-out delay-75 ${getSlideClasses()}`}
        >
          {slides[currentSlide].title}
        </h1>

        {/* Description */}
        <p 
          className={`text-muted-foreground text-center text-sm max-w-xs transition-all duration-300 ease-out delay-100 ${getSlideClasses()}`}
        >
          {slides[currentSlide].description}
        </p>

        {/* Pagination Dots */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              className={`h-2 rounded-full transition-all duration-300 ease-out ${
                index === currentSlide 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 space-y-3 animate-fade-in">
        <Button
          variant="outline"
          className="w-full h-12 text-base border-primary text-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleLogin}
        >
          Log In
        </Button>
        
        <Button
          className="w-full h-12 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleRegister}
        >
          Register
        </Button>

        <button
          onClick={handleSkip}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Just skip for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
