import React, { useState, useEffect, useRef } from 'react';
import { Bell, BriefcaseBusiness, CalendarDays, FileText } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;

    const fetchNotifications = async () => {
      if (!isSupabaseConfigured) return;
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification) => {
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    setIsOpen(false);
    
    // Custom navigation based on type if needed
    if (notification.type === 'placement') navigate('/placement');
    else if (notification.type === 'event') navigate('/events');
    else if (notification.type === 'notice') navigate('/notices');
  };

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'placement': return <BriefcaseBusiness className="w-5 h-5 text-emerald-600" />;
      case 'event': return <CalendarDays className="w-5 h-5 text-purple-600" />;
      case 'exam': return <FileText className="w-5 h-5 text-red-600" />;
      case 'notice': return <Bell className="w-5 h-5 text-amber-600" />;
      default: return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'placement': return 'bg-emerald-50';
      case 'event': return 'bg-purple-50';
      case 'exam': return 'bg-red-50';
      case 'notice': return 'bg-amber-50';
      default: return 'bg-blue-50';
    }
  };

  const formatTimeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - d) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[360px] bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Bell className="w-10 h-10 text-zinc-200 mb-3" />
                <div className="text-zinc-500 font-medium">No notifications yet</div>
                <div className="text-zinc-400 text-xs mt-1">When you get updates, they'll show up here.</div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif)}
                  className={`flex gap-3 p-4 border-b border-zinc-50 cursor-pointer transition-colors ${
                    notif.is_read ? 'bg-white hover:bg-zinc-50' : 'bg-indigo-50/40 hover:bg-indigo-50/80'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm mb-0.5 ${notif.is_read ? 'text-zinc-600 font-medium' : 'text-zinc-900 font-semibold'}`}>
                      {notif.title}
                    </div>
                    <div className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1.5 font-medium">
                      {formatTimeAgo(notif.created_at)}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div className="flex-shrink-0 flex items-center justify-center w-3 pt-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
            <span className="text-[10px] text-zinc-400 font-medium">Delivered via Campus Connect 🔔</span>
          </div>
        </div>
      )}
    </div>
  );
}
