import React, { useEffect, useState } from 'react';
import { 
  Bell, Plus, Eye, Trash2, BellOff, X 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', desc: '' });
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const toggleImportant = async (id, currentVal) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_important: !currentVal })
        .eq('id', id);
        
      if (error) throw error;
      setNotices(notices.map(n => n.id === id ? { ...n, is_important: !currentVal } : n));
      toast.success(currentVal ? 'Removed from important' : 'Marked as important');
    } catch (error) {
      toast.error('Failed to update notice');
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      setNotices(notices.filter(n => n.id !== id));
      toast.success('Notice deleted');
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const total = notices.length;
  const important = notices.filter(n => n.is_important).length;
  // This month logic is simple for display
  const thisMonth = notices.filter(n => new Date(n.created_at).getMonth() === new Date().getMonth()).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">Manage Notices 📢</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Push Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Notices', val: total }, 
          { label: 'Important', val: important }, 
          { label: 'This Month', val: thisMonth }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-sm text-zinc-500">{s.label}</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <BellOff className="w-10 h-10 text-zinc-300 mb-3" />
            <div className="text-zinc-500 font-medium">No notices yet</div>
            <div className="text-zinc-400 text-sm mt-1">Push a notice to get started</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Title</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Type</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Target</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Date</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-center">Important</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((notice) => (
                  <tr key={notice.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 max-w-xs truncate">{notice.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md capitalize">{notice.notice_type || 'Academic'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{notice.target_audience || 'All'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{new Date(notice.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div 
                        onClick={() => toggleImportant(notice.id, notice.is_important)}
                        className={`inline-block w-10 h-6 rounded-full relative cursor-pointer transition-colors ${notice.is_important ? 'bg-red-500' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notice.is_important ? 'left-5' : 'left-1'}`} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-zinc-400 hover:text-indigo-500 rounded hover:bg-indigo-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteNotice(notice.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Push Notice</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Title</label>
                <input 
                  type="text" 
                  placeholder="Notice title..." 
                  value={newNotice.title}
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Details</label>
                <textarea 
                  rows={3} 
                  placeholder="Notice content..." 
                  value={newNotice.desc}
                  onChange={e => setNewNotice({...newNotice, desc: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm resize-none"
                ></textarea>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center border border-zinc-200">
                <span className="text-sm font-medium text-zinc-700">Send email to all students</span>
                <div 
                  onClick={() => setSendEmail(!sendEmail)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${sendEmail ? 'bg-indigo-600' : 'bg-zinc-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${sendEmail ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
              <button 
                onClick={async () => {
                  if (!newNotice.title || !newNotice.desc) {
                    toast.error("Please fill in title and details");
                    return;
                  }
                  try {
                    const { data: insertedNotice, error } = await supabase.from('notices').insert([{
                      title: newNotice.title,
                      content: newNotice.desc,
                      notice_type: 'general',
                      is_important: false
                    }]).select().single();
                    if (error) throw error;
                    
                    setNotices([insertedNotice, ...notices]);
                    
                    if (sendEmail) {
                      const toastId = toast.loading('Publishing notice and sending emails...');
                      const res = await fetch('/api/send-notice-emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: newNotice.title,
                          desc: newNotice.desc
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        toast.success(`Notice pushed! Sent ${data.emailsSent} emails.`, { id: toastId });
                      } else {
                        toast.error(data.error || 'Failed to send emails', { id: toastId });
                      }
                    } else {
                      toast.success('Notice pushed!');
                    }
                    setShowModal(false);
                    setNewNotice({ title: '', desc: '' });
                    setSendEmail(false);
                  } catch (err) {
                    toast.error('Failed to push notice');
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-medium transition-colors"
              >
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
