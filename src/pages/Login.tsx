import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser, loginWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get initial tab from navigation state
  const initialTab = (location.state as { tab?: string })?.tab || 'login';
  const [activeView, setActiveView] = useState<'login' | 'register'>(initialTab as 'login' | 'register');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
        navigate('/dashboard');
      } else {
        toast({ 
          title: 'Login failed', 
          description: result.error || 'Invalid credentials', 
          variant: 'destructive' 
        });
      }
    } catch {
      toast({ 
        title: 'Error', 
        description: 'Something went wrong. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data.email, data.password, data.name);
      if (result.success) {
        toast({ title: 'Account created!', description: 'Welcome to DocsKeeper.' });
        navigate('/dashboard');
      } else {
        toast({ 
          title: 'Registration failed', 
          description: result.error || 'Could not create account', 
          variant: 'destructive' 
        });
      }
    } catch {
      toast({ 
        title: 'Error', 
        description: 'Something went wrong. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
      <div className="p-4">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        {activeView === 'login' ? (
          <>
            {/* Login View */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h1>
              <p className="text-muted-foreground text-sm">
                Login and start manage your documents
              </p>
            </div>

            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-muted-foreground text-sm">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Type your email"
                  {...loginForm.register('email')}
                  className="h-12 bg-muted/50 border-0 rounded-xl placeholder:text-muted-foreground/50"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-muted-foreground text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Type your password"
                    {...loginForm.register('password')}
                    className="h-12 bg-muted/50 border-0 rounded-xl placeholder:text-muted-foreground/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password? Reset password
                </button>
              </div>

              <Button type="submit" className="w-full h-12 text-base rounded-xl mt-6" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <button 
                onClick={() => setActiveView('register')} 
                className="text-primary font-medium hover:underline"
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            {/* Register View */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Join with us!</h1>
              <p className="text-muted-foreground text-sm">
                Register to enjoy our best features
              </p>
            </div>

            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-muted-foreground text-sm">Username</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Type your name"
                  {...registerForm.register('name')}
                  className="h-12 bg-muted/50 border-0 rounded-xl placeholder:text-muted-foreground/50"
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-muted-foreground text-sm">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Type your email"
                  {...registerForm.register('email')}
                  className="h-12 bg-muted/50 border-0 rounded-xl placeholder:text-muted-foreground/50"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-muted-foreground text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Type your password"
                    {...registerForm.register('password')}
                    className="h-12 bg-muted/50 border-0 rounded-xl placeholder:text-muted-foreground/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                By pressing "Register Now" button you agree to our{' '}
                <span className="text-primary">Terms of Use</span> and{' '}
                <span className="text-primary">Privacy Policy</span>.
              </p>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button 
                  onClick={() => setActiveView('login')} 
                  className="text-primary font-medium hover:underline"
                >
                  Log in
                </button>
              </p>

              <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Now
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base rounded-xl border-border"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Register with Google
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
