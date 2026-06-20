import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, BookOpen, School, Bot, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        toast.success("Successfully logged in");
        
        // Check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profile && profile.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch {
      toast.error("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-white min-h-screen w-full flex font-body-md text-on-surface">
      <style dangerouslySetInnerHTML={{__html: `
        .pattern-dots {
            background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 24px 24px;
            animation: movePattern 20s linear infinite;
        }
        @keyframes movePattern {
            0% { background-position: 0 0; }
            100% { background-position: 24px 24px; }
        }
        @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-1 { animation: slideUpFade 0.6s ease-out forwards 0.1s; opacity: 0; }
        .animate-slide-up-2 { animation: slideUpFade 0.6s ease-out forwards 0.2s; opacity: 0; }
        .animate-slide-up-3 { animation: slideUpFade 0.6s ease-out forwards 0.3s; opacity: 0; }
        .animate-slide-up-4 { animation: slideUpFade 0.6s ease-out forwards 0.4s; opacity: 0; }
        .animate-slide-up-5 { animation: slideUpFade 0.6s ease-out forwards 0.5s; opacity: 0; }
        .animate-slide-up-6 { animation: slideUpFade 0.6s ease-out forwards 0.6s; opacity: 0; }
        .input-focus-effect:focus-within {
            transform: scale(1.01);
            box-shadow: 0 0 0 4px rgba(70, 72, 212, 0.1);
        }
        @keyframes float-1 {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-2 {
            0%, 100% { transform: translateY(0) rotate(3deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-3 {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50% { transform: translateY(-10px) rotate(-1deg); }
        }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite 2s; }
      `}} />
      <div className="w-full min-h-screen flex overflow-hidden">
        
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-sidebar-bg relative flex-col justify-center items-center overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-50 z-0"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full mix-blend-screen opacity-20 z-0 blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-purple rounded-full mix-blend-screen opacity-20 z-0 blur-[100px]"></div>

          <div className="z-10 relative text-center px-margin-desktop w-full max-w-2xl">
            <h1 className="font-display-lg text-display-lg text-on-primary mb-stack-md relative inline-block" style={{ fontWeight: 'bold', fontSize: '30px' }}>
                Campus Connect
                <span className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-purple blur-lg opacity-20 -z-10 rounded-xl"></span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary opacity-80 mb-stack-lg">Your campus, connected.</p>

            <div className="relative w-full h-[400px] mt-stack-lg flex items-center justify-center">
              <div className="absolute -left-8 top-10 bg-inverse-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-stack-md flex items-center gap-stack-sm shadow-2xl animate-float-1 hover:rotate-0 transition-transform duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary-fixed">
                  <BookOpen className="w-5 h-5 text-current" />
                </div>
                <div className="text-left">
                  <p className="font-label-md text-label-md text-on-primary">1,200+ Notes Shared</p>
                </div>
              </div>

              <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-inverse-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-stack-md flex items-center gap-stack-sm shadow-2xl animate-float-2 hover:rotate-0 transition-transform duration-300 z-20">
                <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center text-secondary-fixed">
                  <School className="w-5 h-5 text-current" />
                </div>
                <div className="text-left">
                  <p className="font-label-md text-label-md text-on-primary">45 Placement Drives</p>
                </div>
              </div>

              <div className="absolute bottom-10 left-1/4 bg-inverse-surface/80 backdrop-blur-md border border-white/10 rounded-xl p-stack-md flex items-center gap-stack-sm shadow-2xl animate-float-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary-fixed">
                  <Bot className="w-5 h-5 text-current" />
                </div>
                <div className="text-left">
                  <p className="font-label-md text-label-md text-on-primary">AI-Powered Assistant</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-24 py-12 bg-surface-white z-10 relative">
          <div className="w-full max-w-[440px] mx-auto">
            {!isSupabaseConfigured && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex gap-3 text-sm border border-error/20 animate-slide-up-1">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <strong>Environment Variables Missing!</strong>
                  <p className="mt-1">Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel Environment Variables settings.</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-stack-sm mb-stack-lg animate-slide-up-1">
              <div className="w-12 h-12 flex items-center justify-center text-[#2b8c9d] shrink-0">
                <img 
                  src="/campus-connect-logo.png" 
                  alt="Campus Connect" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <svg 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="w-full h-full drop-shadow-sm hidden"
                >
                  <circle cx="40" cy="28" r="6" fill="currentColor" stroke="none" />
                  <circle cx="60" cy="28" r="6" fill="currentColor" stroke="none" />
                  <path d="M 33 40 C 15 45 15 80 43 95" />
                  <path d="M 67 40 C 85 45 85 80 57 95" />
                  <path d="M 33 62 C 35 78 45 78 47 62" />
                  <path d="M 67 62 C 65 78 55 78 53 62" />
                  <circle cx="50" cy="62" r="4.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface" style={{ fontWeight: 'bold', fontSize: '30px' }}>Campus Connect</span>
            </div>

            <div className="mb-stack-lg animate-slide-up-2">
              <h2 className="font-display-lg text-display-lg text-on-surface mb-stack-sm">Welcome back 👋</h2>
              <p className="font-body-md text-body-md text-text-muted">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-stack-md w-full">
              <div className="flex flex-col gap-base animate-slide-up-3">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">College Email</label>
                <div className="relative flex items-center transition-all duration-300 input-focus-effect rounded-lg">
                  <Mail className="absolute left-3 w-5 h-5 text-text-muted transition-colors duration-300" />
                  <input 
                    className="w-full pl-10 pr-3 py-2 border border-border-subtle rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 bg-surface-container-lowest peer" 
                    id="email" 
                    placeholder="you@mail.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-base animate-slide-up-4">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                <div className="relative flex items-center transition-all duration-300 input-focus-effect rounded-lg">
                  <Lock className="absolute left-3 w-5 h-5 text-text-muted transition-colors duration-300" />
                  <input 
                    className="w-full pl-10 pr-10 py-2 border border-border-subtle rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 bg-surface-container-lowest peer" 
                    id="password" 
                    placeholder="Enter your password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-3 text-text-muted hover:text-on-surface-variant transition-colors flex items-center justify-center p-1" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="animate-slide-up-5 mt-stack-md !mt-6">
                <button 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary via-accent-purple to-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" 
                  type="submit"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </div>
            </form>

            <div className="mt-stack-lg flex items-center justify-center animate-slide-up-6">
              <div className="flex-grow border-t border-border-subtle"></div>
              <span className="px-3 font-body-sm text-body-sm text-text-muted">or</span>
              <div className="flex-grow border-t border-border-subtle"></div>
            </div>

            <div className="mt-stack-md text-center animate-slide-up-6">
              <p className="font-body-sm text-body-sm text-text-muted">
                  Don&apos;t have an account? <Link className="text-primary hover:text-accent-purple font-label-md text-label-md transition-colors" to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
