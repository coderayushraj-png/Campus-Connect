import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    branch: '',
    semester: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            branch: formData.branch,
            semester: formData.semester
          }
        }
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Success! Please check your email inbox, click on the verification link, and then log in with the same credentials.", { duration: 8000 });
        navigate('/login');
      }
    } catch {
      toast.error("Error signing up");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex flex-col font-sans text-on-surface relative">
      <style dangerouslySetInnerHTML={{__html: `
        .dot-pattern {
            background-image: radial-gradient(var(--color-outline-variant) 1px, transparent 1px);
            background-size: 24px 24px;
            opacity: 0.15;
        }
        .soft-shadow {
            box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1);
        }
      `}} />
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="font-headline-md text-headline-md font-bold tracking-tight text-primary">Campus Connect</div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center relative pt-24 pb-12 px-margin-mobile z-10 w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 dot-pattern pointer-events-none -z-10"></div>
        
        {/* Registration Card */}
        <div className="bg-surface-container-lowest w-full max-w-[480px] rounded-xl soft-shadow border border-border-subtle p-8 sm:p-10">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex gap-3 text-sm border border-error/20">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <strong>Environment Variables Missing!</strong>
                <p className="mt-1">Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your AI Studio Secrets panel.</p>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center mb-4 w-24 h-24 text-[#2b8c9d] shrink-0">
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
            <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mb-2">Create Account 🎓</h1>
            <p className="font-body-sm text-body-sm text-text-muted text-center">Join Campus Connect today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-stack-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body-md text-body-md text-on-surface placeholder:text-outline transition-all" 
                  id="fullName" 
                  placeholder="Ayush" 
                  type="text" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="email">College Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body-md text-body-md text-on-surface placeholder:text-outline transition-all" 
                  id="email" 
                  placeholder="you@mail.com" 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body-md text-body-md text-on-surface placeholder:text-outline transition-all" 
                  id="password" 
                  placeholder="Minimum 6 characters" 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors flex items-center justify-center p-1" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-gutter">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="branch">Branch</label>
                <select 
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body-md text-body-md text-on-surface appearance-none transition-all" 
                  id="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">Select</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="EE">EE</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="semester">Semester</label>
                <select 
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-body-md text-body-md text-on-surface appearance-none transition-all" 
                  id="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-tertiary-container hover:from-surface-tint hover:to-tertiary text-on-primary rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-label-md text-label-md transition-all duration-200 shadow-[0_4px_14px_0_rgba(70,72,212,0.39)] hover:shadow-[0_6px_20px_rgba(70,72,212,0.23)] hover:-translate-y-[1px]" 
                type="submit"
              >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body-sm text-body-sm text-text-muted">
                Already have an account? 
                <Link className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors ml-1 hover:underline" to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-12 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-md max-w-7xl mx-auto bg-surface-container-lowest border-t border-outline-variant/30 mt-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-headline-sm text-headline-sm font-bold text-on-surface">Campus Connect</div>
          <p className="font-body-sm text-body-sm text-text-muted">© 2026 Campus Connect AI. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors" href="#">By Ayush</a>
        </nav>
      </footer>
    </div>
  );
}
