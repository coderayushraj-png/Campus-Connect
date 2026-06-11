import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Medal, MessageSquare, BookOpen, Users,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState({
    notes: 0, events: 0, drives: 0, posts: 0, notices: 0, clubs: 0
  });
  
  const [branches, setBranches] = useState([]);
  const [topNotes, setTopNotes] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch basic counts
      const [n, e, d, p, noti, c] = await Promise.all([
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('placements').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
        supabase.from('notices').select('*', { count: 'exact', head: true }),
        supabase.from('clubs').select('*', { count: 'exact', head: true })
      ]);

      setMetrics({
        notes: n.count || 0,
        events: e.count || 0,
        drives: d.count || 0,
        posts: p.count || 0,
        notices: noti.count || 0,
        clubs: c.count || 0
      });

      // Fetch branch distribution
      const { data: branchData } = await supabase.from('profiles').select('branch');
      if (branchData) {
        const branchCounts = branchData.reduce((acc, curr) => {
          const b = curr.branch || 'Other';
          acc[b] = (acc[b] || 0) + 1;
          return acc;
        }, {});
        
        const total = branchData.length;
        const formattedBranches = Object.entries(branchCounts).map(([name, count]) => ({
          name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0
        })).sort((a, b) => b.count - a.count);
        
        setBranches(formattedBranches);
      }

      // Fetch Top Notes
      const { data: popularNotes } = await supabase
        .from('notes')
        .select('id, title, subject, download_count')
        .order('download_count', { ascending: false })
        .limit(5);
      setTopNotes(popularNotes || []);

      // Fetch Top Posts
      const { data: popularPosts } = await supabase
        .from('forum_posts')
        .select('id, title, upvotes, replies_count')
        .order('upvotes', { ascending: false })
        .limit(5);
      setTopPosts(popularPosts || []);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Gathering insights...</div>;
  }

  const contentRows = [
    { name: 'Notes', total: metrics.notes, month: '+12' },
    { name: 'Events', total: metrics.events, month: '+3' },
    { name: 'Drives', total: metrics.drives, month: '+5' },
    { name: 'Forum', total: metrics.posts, month: '+28' },
    { name: 'Notices', total: metrics.notices, month: '+4' },
    { name: 'Clubs', total: metrics.clubs, month: '+1' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">Analytics & Insights 📊</h1>
      </div>

      {/* ROW 1: KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Notes', val: metrics.notes }, 
          { label: 'Total Events', val: metrics.events }, 
          { label: 'Total Drives', val: metrics.drives },
          { label: 'Forum Posts', val: metrics.posts }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-sm text-zinc-500">{s.label}</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      {/* ROW 2: CONTENT STATS TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <h2 className="font-semibold text-zinc-900 mb-4">Content Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Category</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Total</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">This Month</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {contentRows.map((row) => (
                <tr key={row.name} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{row.total}</td>
                  <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{row.month}</td>
                  <td className="px-4 py-3 text-right">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 3: TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Downloaded Notes */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Most Downloaded Notes 📚</h2>
          <div className="space-y-4">
            {topNotes.length > 0 ? topNotes.map((note, i) => (
              <div key={note.id} className="flex items-center gap-3">
                <div className="w-8 text-center text-lg">{getMedal(i)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-zinc-900 truncate">{note.title}</div>
                  <div className="text-xs text-zinc-500 truncate">{note.subject}</div>
                </div>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  {note.download_count} DLs
                </div>
              </div>
            )) : <p className="text-sm text-zinc-500">Not enough data.</p>}
          </div>
        </div>

        {/* Trending Discussions */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Trending Discussions 💬</h2>
          <div className="space-y-4">
            {topPosts.length > 0 ? topPosts.map((post, i) => (
              <div key={post.id} className="flex items-center gap-3">
                <div className="w-8 text-center font-bold text-zinc-400">{i + 1}.</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-zinc-900 truncate">{post.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 flex gap-2">
                    <span className="flex items-center gap-1 text-emerald-600"><ArrowUpRight className="w-3 h-3"/> {post.upvotes}</span>
                    <span className="flex items-center gap-1 text-blue-600"><MessageSquare className="w-3 h-3"/> {post.replies_count}</span>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-zinc-500">Not enough data.</p>}
          </div>
        </div>
      </div>

      {/* ROW 4: BRANCH DISTRIBUTION */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <h2 className="font-semibold text-zinc-900 mb-4">Students by Branch</h2>
        <div className="space-y-3 max-w-2xl">
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
