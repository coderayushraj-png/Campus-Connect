import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Calendar, Briefcase, Search, MessageSquare, 
  Megaphone, Users, Bot, ChevronsUpDown, Settings, Clock, 
  X, Moon, Sun, Bell, Lock, LogOut, Palette, CheckCircle2, Menu
} from 'lucide-react';
import AIBuddy from '@/components/AIBuddy';
import NotificationBell from '@/components/NotificationBell';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [userInitials, setUserInitials] = useState("ST");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSupabaseConfigured) {
        navigate('/login');
        return;
      }
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (authError?.message?.includes('Refresh Token')) {
            await supabase.auth.signOut();
          }
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          navigate('/admin/dashboard');
          return;
        }

        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
          const initials = user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          setUserInitials(initials);
        }
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Deadlines', path: '/deadlines', icon: Clock },
    { name: 'Placement', path: '/placement', icon: Briefcase },
    { name: 'Lost & Found', path: '/lost-found', icon: Search },
    { name: 'Forum', path: '/forum', icon: MessageSquare },
    { name: 'Notices', path: '/notices', icon: Megaphone },
    { name: 'Clubs', path: '/clubs', icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f4f5] text-on-surface">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-[240px] md:w-[280px] bg-sidebar-bg flex flex-col z-50 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 mr-3 flex items-center justify-center shrink-0 text-[#2b8c9d]">
            <img 
              src="/campus-connect-logo.png" 
              alt="Campus Connect" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'block';
              }}
            />
            {/* Fallback SVG representing the Campus Connect logo */}
            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-full h-full drop-shadow-sm hidden"
            >
              {/* Heads */}
              <circle cx="40" cy="28" r="6" fill="currentColor" stroke="none" />
              <circle cx="60" cy="28" r="6" fill="currentColor" stroke="none" />
              {/* Outer Bodies */}
              <path d="M 33 40 C 15 45 15 80 43 95" />
              <path d="M 67 40 C 85 45 85 80 57 95" />
              {/* Inner Arms */}
              <path d="M 33 62 C 35 78 45 78 47 62" />
              <path d="M 67 62 C 65 78 55 78 53 62" />
              {/* Center Connection */}
              <circle cx="50" cy="62" r="4.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <span className="font-headline-md text-headline-md text-white block leading-tight" style={{ fontWeight: 'bold', fontSize: '21.2px' }}>Campus Connect</span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Student Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg font-label-md text-label-md transition-all duration-200",
                  isActive 
                    ? "bg-[#18181b] border-l-[3px] border-primary text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/5 opacity-80 hover:opacity-100"
                )}
              >
                <Icon className={cn("mr-3 w-5 h-5", isActive ? "fill-primary/20 text-primary" : "")} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Widgets */}
        <div className="p-4 space-y-4 shrink-0 border-t border-white/10">
          <button 
            onClick={() => setIsAIOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            <Bot className="w-4 h-4" />
            AI Buddy
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col md:ml-[280px] w-full md:w-[calc(100%-280px)] min-h-screen relative transition-all">
        {/* Fixed Top Navbar */}
        <header className="h-[64px] bg-surface-white border-b border-border-subtle flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0">
          <div className="flex-1 flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-text-muted hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Search removed */}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <div className="w-px h-6 bg-border-subtle mx-1"></div>
            <Link 
              to="/settings"
              className="w-10 h-10 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-primary/5 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <Link 
              to="/profile"
              className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-sm font-bold border border-border-subtle ml-2 cursor-pointer hover:border-primary transition-colors">
              {userInitials}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-low">
          <Outlet context={{ userName, userInitials }} />
        </main>
      </div>

      <AIBuddy isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
}
