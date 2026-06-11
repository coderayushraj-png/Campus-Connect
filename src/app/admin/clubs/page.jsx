import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedClubLogs, setSelectedClubLogs] = useState({ club: null, members: [], isLoading: false });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technical',
    logo_url: ''
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clubs')
      .select('*, profiles (*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
    } else {
      setClubs(data || []);
    }
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;

    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Club deleted successfully');
      setClubs(clubs.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete club');
    }
  };

  const openMembers = async (club) => {
    setSelectedClubLogs({ club, members: [], isLoading: true });
    setMembersModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          id,
          joined_at,
          user_id,
          profiles:user_id ( name, email, branch, semester )
        `)
        .eq('club_id', club.id)
        .order('joined_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          toast.info("Database table 'club_members' is missing.");
        } else {
          toast.error("Failed to fetch members.");
        }
        setSelectedClubLogs({ club, members: [], isLoading: false });
        return;
      }
      
      setSelectedClubLogs({ club, members: data || [], isLoading: false });
    } catch (e) {
      toast.error("An error occurred.");
      setSelectedClubLogs({ club, members: [], isLoading: false });
    }
  };

  const handleOpenModal = (club = null) => {
    if (club) {
      setEditingClub(club);
      setFormData({
        name: club.name || '',
        description: club.description || '',
        category: club.category || 'technical',
        logo_url: club.logo_url || ''
      });
    } else {
      setEditingClub(null);
      setFormData({
        name: '',
        description: '',
        category: 'technical',
        logo_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) throw new Error("Not authenticated");

      let saveError;

      if (editingClub) {
        const { error } = await supabase
          .from('clubs')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            logo_url: formData.logo_url
          })
          .eq('id', editingClub.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('clubs')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              category: formData.category,
              logo_url: formData.logo_url,
              coordinator_id: user.id,
              member_count: 0
            }
          ]);
        saveError = error;
      }

      if (saveError) {
        console.error("Save error:", saveError);
        throw saveError;
      }

      toast.success(`Club ${editingClub ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      fetchClubs();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save club');
    }
  };

  const filteredClubs = clubs.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Clubs Management</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage campus clubs, categories, and details.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Club
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search clubs by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Club Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Members</th>
                <th className="px-6 py-4 font-semibold">Coordinator</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredClubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No clubs found.
                  </td>
                </tr>
              ) : (
                filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                          {club.logo_url ? (
                            <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-zinc-400 text-xs">{(club.name||"CB").substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{club.name}</div>
                          <div className="text-xs text-zinc-500 line-clamp-1 max-w-[250px]">{club.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                        {club.category || 'general'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-700">
                      {club.member_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                          {club.profiles?.avatar_url ? (
                            <img src={club.profiles?.avatar_url} alt="C" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                              {(club.profiles?.full_name || club.profiles?.name || 'U')[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-zinc-600 line-clamp-1 max-w-[120px]">
                          {club.profiles?.full_name || club.profiles?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openMembers(club)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex cursor-pointer"
                        title="View Members"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(club)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors inline-flex cursor-pointer"
                        title="Edit Club"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(club.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors inline-flex cursor-pointer"
                        title="Delete Club"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {membersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Club Members</h2>
                <p className="text-sm text-zinc-500 mt-1">{selectedClubLogs.club?.name}</p>
              </div>
              <button 
                onClick={() => setMembersModalOpen(false)} 
                className="text-zinc-400 hover:text-zinc-600 transition-colors bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              {selectedClubLogs.isLoading ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  Loading members...
                </div>
              ) : selectedClubLogs.members.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Users className="w-12 h-12 text-zinc-200 mb-3" />
                  <div className="text-zinc-500 font-medium text-lg">No one joined yet</div>
                  <p className="text-zinc-400 text-sm mt-1">Users will appear here once they join the club.</p>
                </div>
              ) : (
                <table className="w-full text-left bg-white">
                  <thead className="bg-white border-b border-zinc-100 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold bg-white">Student Name</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold bg-white">Branch / Sem</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold text-right bg-white">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClubLogs.members.map((member) => (
                      <tr key={member.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{member.profiles?.name || 'Unknown Student'}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{member.profiles?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-700 bg-zinc-100 px-2 py-1 rounded inline-block">{member.profiles?.branch || 'N/A'}</div>
                          <div className="text-xs text-zinc-500 mt-1">Sem {member.profiles?.semester || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500 text-right font-medium">
                          {new Date(member.joined_at).toLocaleDateString()}<br/>
                          <span className="text-xs font-normal text-zinc-400">{new Date(member.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <div className="text-sm font-medium text-zinc-500">Total: {selectedClubLogs.members?.length || 0} students</div>
              <button 
                onClick={() => setMembersModalOpen(false)}
                className="px-5 py-2 font-medium text-zinc-600 bg-white hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200 shadow-sm leading-none flex items-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-900">
                {editingClub ? 'Edit Club' : 'Add New Club'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Club Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="E.g., Google Developer Student Club" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="social">Social</option>
                  <option value="creative">Creative</option>
                  <option value="academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" 
                  placeholder="What is the club about?" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Logo URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.logo_url}
                  onChange={e => setFormData({...formData, logo_url: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  placeholder="https://example.com/logo.png" 
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end items-center border-t border-zinc-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  {editingClub ? 'Save Changes' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
