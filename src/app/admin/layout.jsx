import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bell, BriefcaseBusiness, CalendarDays, Users, UserCog, BarChart3, LogOut, Shield, Menu, X
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSupabaseConfigured) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          setCurrentUser({ ...user, ...profile });
        }
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };
    
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { label: "OVERVIEW" },
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: "MANAGE" },
    { name: 'Notices', path: '/admin/notices', icon: Bell },
    { name: 'Placements', path: '/admin/placements', icon: BriefcaseBusiness },
    { name: 'Events', path: '/admin/events', icon: CalendarDays },
    { name: 'Clubs', path: '/admin/clubs', icon: Users },
    { label: "PEOPLE" },
    { name: 'Users', path: '/admin/users', icon: UserCog },
    { label: "INSIGHTS" },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  // Handle page title for navbar
  const currentLink = navLinks.find(link => link.path === location.pathname);
  const pageTitle = currentLink ? currentLink.name : "Admin Panel";

  const userInitials = currentUser?.full_name 
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="flex h-screen bg-[#f4f4f5] overflow-hidden text-zinc-900">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`w-[260px] h-screen bg-white border-r border-zinc-200 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* TOP SECTION */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="text-indigo-600 w-[22px] h-[22px] mr-2 shrink-0" />
            <span className="font-bold text-zinc-900 text-[15px] hidden sm:block">Campus Connect</span>
            <span className="font-bold text-zinc-900 text-[15px] sm:hidden">Campus</span>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-2 shrink-0">
              Admin
            </span>
          </div>
          <button 
            className="md:hidden p-1 text-zinc-400 hover:bg-zinc-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="p-3 flex-1 overflow-y-auto">
          {navLinks.map((link, index) => {
            if (link.label) {
              return (
                <div key={index} className="text-[10px] text-zinc-400 uppercase tracking-widest px-3 py-2 mt-2">
                  {link.label}
                </div>
              );
            }
            
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${
                  isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-medium' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-zinc-500'}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-zinc-100 p-3">
          <div className="px-3 py-2.5 flex items-center gap-3 hover:bg-zinc-50 rounded-xl mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-zinc-900 text-[13px] font-medium truncate">{currentUser?.full_name || 'Admin User'}</span>
            </div>
            <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-full">admin</span>
            <LogOut 
              className="text-zinc-400 w-[15px] h-[15px] hover:text-zinc-700 cursor-pointer ml-1" 
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* ADMIN NAVBAR */}
      <div className="fixed top-0 md:left-[260px] left-0 right-0 h-[56px] bg-white border-b border-zinc-200 flex justify-between items-center px-4 md:px-6 z-10 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-indigo-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg text-zinc-900 truncate hidden sm:block">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-medium px-3 py-1.5 rounded-full">
            <Shield className="w-3 h-3" />
            Admin Mode
          </div>
          <button className="relative p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-full cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm cursor-pointer">
            {userInitials}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="md:ml-[260px] ml-0 pt-[56px] w-full flex-1 overflow-y-auto transition-all duration-300">
        <div className="p-4 md:p-6 w-full max-w-[100vw]">
          <Outlet context={{ currentUser }} />
        </div>
      </div>
    </div>
  );
}
