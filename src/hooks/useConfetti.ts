import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const triggerConfetti = () => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'],
    });

    // Second burst after small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4'],
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#10b981', '#8b5cf6'],
      });
    }, 300);
  };

  const triggerFirstUploadCelebration = () => {
    // Check if this is the first upload
    const hasUploaded = localStorage.getItem('hasUploadedDocument');
    
    if (!hasUploaded) {
      localStorage.setItem('hasUploadedDocument', 'true');
      
      // Trigger multiple confetti bursts for celebration
      triggerConfetti();
      
      // Additional celebration burst
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 180,
          origin: { y: 0.4 },
          colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'],
          ticks: 200,
          gravity: 0.8,
          scalar: 1.2,
        });
      }, 500);
      
      return true; // First upload
    }
    
    return false; // Not first upload
  };

  return {
    triggerConfetti,
    triggerFirstUploadCelebration,
  };
};
