import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Users, BriefcaseBusiness, BookOpen, MessageSquare, 
  Bell, CalendarDays, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    drives: 0,
    notes: 0,
    posts: 0
  });

  const [activities, setActivities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch basic counts
      const [usersCount, drivesCount, notesCount, postsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('placements').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersCount.count || 0,
        drives: drivesCount.count || 0,
        notes: notesCount.count || 0,
        posts: postsCount.count || 0
      });

      // Fetch branch distribution
      const { data: branchData } = await supabase
        .from('profiles')
        .select('branch');
      
      if (branchData) {
        const branchCounts = branchData.reduce((acc, curr) => {
          const b = curr.branch || 'Other';
          acc[b] = (acc[b] || 0) + 1;
          return acc;
        }, {});
        
        const total = branchData.length;
        const formattedBranches = Object.entries(branchCounts).map(([name, count]) => ({
          name, 
          count, 
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        })).sort((a, b) => b.count - a.count);
        
        setBranches(formattedBranches);
      }

      // Fetch recent activity mock (since merging 4 tables requires complex queries or RPC)
      // We will do a generic approach fetching a few latest from each and sorting
      const [latestNotes, latestEvents] = await Promise.all([
        supabase.from('notes').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('events').select('id, title, created_at').order('created_at', { ascending: false }).limit(3)
      ]);

      let mergedActivity = [];
      if (latestNotes.data) mergedActivity.push(...latestNotes.data.map(n => ({...n, type: 'note', action: `uploaded ${n.title}`, icon: BookOpen, color: 'text-blue-500'})));
      if (latestEvents.data) mergedActivity.push(...latestEvents.data.map(n => ({...n, type: 'event', action: `created event ${n.title}`, icon: CalendarDays, color: 'text-purple-500'})));
      
      mergedActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setActivities(mergedActivity);

    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-12 bg-zinc-200 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-4 gap-4"><div className="h-32 bg-zinc-200 rounded-2xl"></div><div className="h-32 bg-zinc-200 rounded-2xl"></div><div className="h-32 bg-zinc-200 rounded-2xl"></div><div className="h-32 bg-zinc-200 rounded-2xl"></div></div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{getGreeting()}, Admin 👋</h1>
          <p className="text-zinc-500 mt-1">Platform overview for today</p>
        </div>
        <button 
          onClick={async () => {
            const toastId = toast.loading("Checking & sending emails...");
            try {
              const res = await fetch('/api/trigger-deadlines', { method: 'POST' });
              const data = await res.json();
              if (res.ok) {
                toast.success(`Success! Sent ${data.emailsSent} emails.`, { id: toastId });
              } else {
                toast.error(data.error || 'Failed to send', { id: toastId });
              }
            } catch (err) {
              toast.error('Network Error', { id: toastId });
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Bell className="w-4 h-4" /> Trigger Deadline Emails
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, cColor: 'text-indigo-400', pText: '+12 this week' },
          { label: 'Active Drives', value: stats.drives, icon: BriefcaseBusiness, cColor: 'text-purple-400', pText: '+2 this week' },
          { label: 'Notes Uploaded', value: stats.notes, icon: BookOpen, cColor: 'text-blue-400', pText: '+45 this week' },
          { label: 'Forum Posts', value: stats.posts, icon: MessageSquare, cColor: 'text-amber-400', pText: '+89 this week' }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 rounded-2xl p-5 text-white relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <stat.icon className={`w-8 h-8 ${stat.cColor}`} />
              <div className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">{stat.pText}</div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT ACTIVITY */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.length > 0 ? activities.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">Someone {item.action}</p>
                  <p className="text-xs text-zinc-400">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p className="text-zinc-500 text-sm">No recent activity.</p>}
          </div>
        </div>

        {/* QUICK ACTIONS & HEALTH */}
        <div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => navigate('/admin/notices')} className="border border-zinc-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer text-center group transition-colors">
                <Bell className="w-6 h-6 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-zinc-700">Post Notice</div>
              </div>
              <div onClick={() => navigate('/admin/placements')} className="border border-zinc-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer text-center group transition-colors">
                <BriefcaseBusiness className="w-6 h-6 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-zinc-700">Add Drive</div>
              </div>
              <div onClick={() => navigate('/admin/events')} className="border border-zinc-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer text-center group transition-colors">
                <CalendarDays className="w-6 h-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-zinc-700">Add Event</div>
              </div>
              <div onClick={() => navigate('/admin/users')} className="border border-zinc-200 rounded-xl p-4 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer text-center group transition-colors">
                <Users className="w-6 h-6 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-zinc-700">View Users</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 mt-6">
            <h2 className="font-semibold text-zinc-900 mb-4">Platform Health</h2>
            <div className="space-y-4">
              {[
                { label: 'Active Users Today', p: '24%', bg: 'bg-indigo-500', width: '24%' },
                { label: 'Notes Uploaded This Week', p: '68%', bg: 'bg-emerald-500', width: '68%' },
                { label: 'Forum Activity', p: '85%', bg: 'bg-purple-500', width: '85%' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-zinc-600">{item.label}</span>
                    <span className="text-sm font-medium text-zinc-900">{item.p}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full w-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${item.bg}`} style={{ width: item.width }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BRANCH DISTRIBUTION */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 mt-6">
        <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">Students by Branch 🎓</h2>
        <div className="space-y-3">
          {branches.length > 0 ? branches.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 text-xs font-medium text-zinc-700">{b.name}</div>
              <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="h-full bg-indigo-500 rounded-full absolute left-0 top-0 transition-all duration-1000" style={{ width: `${b.percentage}%` }}></div>
              </div>
              <div className="text-xs text-zinc-500 w-16 text-right">{b.count} ({b.percentage}%)</div>
            </div>
          )) : <p className="text-sm text-zinc-500">No branch data available</p>}
        </div>
      </div>
    </div>
  );
}
