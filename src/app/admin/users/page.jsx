import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Eye, Filter, UserX, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);
        
      if (error) throw error;
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const studentsCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const newThisWeek = users.filter(u => {
    const diff = new Date() - new Date(u.created_at);
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">User Management 👥</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', val: users.length }, 
          { label: 'Students', val: studentsCount }, 
          { label: 'Faculty', val: facultyCount },
          { label: 'New This Week', val: newThisWeek }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-sm text-zinc-500">{s.label}</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none"
        >
          {['All', 'Student', 'Faculty', 'Admin', 'Placement_Cell'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <UserX className="w-10 h-10 text-zinc-300 mb-3" />
            <div className="text-zinc-500 font-medium">No users found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">User</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Branch</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Semester</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Role</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Joined</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const initials = user.name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'U';
                  
                  return (
                    <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-zinc-900">{user.name || 'Unnamed'}</div>
                            <div className="text-xs text-zinc-400">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md">{user.branch || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{user.semester || '-'}</td>
                      <td className="px-4 py-3">
                        <select 
                          value={user.role || 'student'}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className="border border-zinc-200 rounded-lg text-xs py-1 px-2 outline-none bg-white font-medium text-zinc-700 focus:border-indigo-500"
                        >
                          <option value="student">student</option>
                          <option value="faculty">faculty</option>
                          <option value="admin">admin</option>
                          <option value="placement_cell">placement_cell</option>
                          <option value="club_coordinator">club_coordinator</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-[380px] h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="font-bold text-zinc-900">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md">
                  {selectedUser.name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'U'}
                </div>
                <h3 className="font-bold text-lg text-zinc-900">{selectedUser.name || 'Unnamed'}</h3>
                <p className="text-zinc-500 text-sm mb-2">{selectedUser.email}</p>
                <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full uppercase font-medium">{selectedUser.role}</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div className="text-[10px] uppercase text-zinc-500 font-semibold">Branch</div>
                    <div className="text-sm font-medium text-zinc-900 mt-0.5">{selectedUser.branch || '-'}</div>
                  </div>
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div className="text-[10px] uppercase text-zinc-500 font-semibold">Semester</div>
                    <div className="text-sm font-medium text-zinc-900 mt-0.5">{selectedUser.semester || '-'}</div>
                  </div>
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div className="text-[10px] uppercase text-zinc-500 font-semibold">Joined Date</div>
                    <div className="text-sm font-medium text-zinc-900 mt-0.5">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
