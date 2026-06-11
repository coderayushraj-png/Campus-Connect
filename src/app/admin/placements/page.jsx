import React, { useEffect, useState } from 'react';
import { 
  BriefcaseBusiness, Plus, Edit, Trash2, X, Briefcase, Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDrive, setNewDrive] = useState({
    company: '',
    role: '',
    job_type: 'full_time',
    package: '',
    deadline: '',
    eligible_branches: [] // We could use a string and split by comma
  });

  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
  const [selectedPlacementLogs, setSelectedPlacementLogs] = useState({ placement: null, applicants: [], isLoading: false });

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('placements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPlacements(data || []);
    } catch (error) {
      toast.error('Failed to load placements');
    } finally {
      setLoading(false);
    }
  };

  const openApplications = async (placement) => {
    setSelectedPlacementLogs({ placement, applicants: [], isLoading: true });
    setApplicationsModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('placement_applications')
        .select(`
          id,
          applied_at,
          user_id,
          profiles:user_id ( name, email, branch, semester )
        `)
        .eq('placement_id', placement.id)
        .order('applied_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          toast.info("Database table 'placement_applications' is missing. Please create it via SQL.");
        } else {
          toast.error("Failed to fetch applications.");
        }
        setSelectedPlacementLogs({ placement, applicants: [], isLoading: false });
        return;
      }
      
      setSelectedPlacementLogs({ placement, applicants: data || [], isLoading: false });
    } catch (e) {
      toast.error("An error occurred.");
      setSelectedPlacementLogs({ placement, applicants: [], isLoading: false });
    }
  };

  const handleAddDrive = async (e) => {
    e.preventDefault();
    try {
      const branchesArray = typeof newDrive.eligible_branches === 'string' 
        ? newDrive.eligible_branches.split(',').map(b => b.trim()).filter(Boolean)
        : newDrive.eligible_branches;

      const placementCode = {
        ...newDrive,
        eligible_branches: branchesArray,
        is_active: true
      };

      const { data: insertedPlacement, error } = await supabase
        .from('placements')
        .insert([placementCode])
        .select()
        .single();
        
      if (error) throw error;

      // Auto-add deadline
      if (insertedPlacement.deadline) {
        const { error: deadlineError } = await supabase.from('deadlines').insert({
          title: insertedPlacement.company + ' - ' + insertedPlacement.role + ' Application Deadline',
          date: insertedPlacement.deadline,
          type: 'placement',
          related_id: insertedPlacement.id,
          target_branches: branchesArray,
          is_active: true
        });
        if (deadlineError) console.error("Error adding deadline:", deadlineError);
      }

      setPlacements([insertedPlacement, ...placements]);
      setIsAddModalOpen(false);
      setNewDrive({ company: '', role: '', job_type: 'full_time', package: '', deadline: '', eligible_branches: [] });
      toast.success('Drive added successfully');
    } catch (error) {
      toast.error('Failed to add drive');
      console.error(error);
    }
  };

  const toggleActive = async (id, currentVal) => {
    try {
      const { error } = await supabase
        .from('placements')
        .update({ is_active: !currentVal })
        .eq('id', id);
        
      if (error) throw error;
      setPlacements(placements.map(p => p.id === id ? { ...p, is_active: !currentVal } : p));
      toast.success(currentVal ? 'Drive deactivated' : 'Drive activated');
    } catch (error) {
      toast.error('Failed to update drive');
    }
  };

  const deletePlacement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) return;
    try {
      const { error } = await supabase.from('placements').delete().eq('id', id);
      if (error) throw error;
      setPlacements(placements.filter(p => p.id !== id));
      toast.success('Drive deleted');
    } catch (error) {
      toast.error('Failed to delete drive');
    }
  };

  const active = placements.filter(p => p.is_active).length;
  const closingThisWeek = placements.filter(p => {
    if (!p.deadline || !p.is_active) return false;
    const diff = new Date(p.deadline) - new Date();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const companies = new Set(placements.map(p => p.company)).size;
  const total = placements.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">Manage Placements 🎓</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Drive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Drives', val: active }, 
          { label: 'Closing This Week', val: closingThisWeek }, 
          { label: 'Total Companies', val: companies },
          { label: 'Total Drives', val: total }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-sm text-zinc-500">{s.label}</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading drives...</div>
        ) : placements.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Briefcase className="w-10 h-10 text-zinc-300 mb-3" />
            <div className="text-zinc-500 font-medium">No drives yet</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Company</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Role</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Type</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Package</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium">Deadline</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-center">Status</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((drive) => {
                  const isClosingSoon = new Date(drive.deadline) - new Date() <= 3 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <tr key={drive.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase">
                            {drive.company?.substring(0,2) || 'C'}
                          </div>
                          <span className="font-medium text-sm text-zinc-900">{drive.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{drive.role}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md">{drive.job_type === 'internship' ? 'Internship' : 'Full Time'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{drive.package || 'TBD'}</td>
                      <td className={`px-4 py-3 text-sm ${isClosingSoon && drive.is_active ? 'text-red-500 font-medium' : 'text-zinc-500'}`}>
                        {drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div 
                          onClick={() => toggleActive(drive.id, drive.is_active)}
                          className={`inline-block w-10 h-6 rounded-full relative cursor-pointer transition-colors ${drive.is_active ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${drive.is_active ? 'left-5' : 'left-1'}`} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openApplications(drive)}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            title="View Applications"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-zinc-400 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deletePlacement(drive.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {applicationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Applied Students</h2>
                <p className="text-sm text-zinc-500 mt-1">{selectedPlacementLogs.placement?.role} at {selectedPlacementLogs.placement?.company}</p>
              </div>
              <button 
                onClick={() => setApplicationsModalOpen(false)} 
                className="text-zinc-400 hover:text-zinc-600 transition-colors bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              {selectedPlacementLogs.isLoading ? (
                <div className="p-8 text-center text-zinc-400 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-zinc-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                  Loading applications...
                </div>
              ) : selectedPlacementLogs.applicants.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Users className="w-12 h-12 text-zinc-200 mb-3" />
                  <div className="text-zinc-500 font-medium text-lg">No one applied yet</div>
                  <p className="text-zinc-400 text-sm mt-1">Users will appear here once they apply for this drive.</p>
                </div>
              ) : (
                <table className="w-full text-left bg-white">
                  <thead className="bg-white border-b border-zinc-100 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold bg-white">Student Name</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold bg-white">Branch / Sem</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wide text-zinc-500 font-semibold text-right bg-white">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlacementLogs.applicants.map((app) => (
                      <tr key={app.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{app.profiles?.name || 'Unknown Student'}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{app.profiles?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-zinc-700 bg-zinc-100 px-2 py-1 rounded inline-block">{app.profiles?.branch || 'N/A'}</div>
                          <div className="text-xs text-zinc-500 mt-1">Sem {app.profiles?.semester || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500 text-right font-medium">
                          {new Date(app.applied_at).toLocaleDateString()}<br/>
                          <span className="text-xs font-normal text-zinc-400">{new Date(app.applied_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <div className="text-sm font-medium text-zinc-500">Total: {selectedPlacementLogs.applicants?.length || 0} students</div>
              <button 
                onClick={() => setApplicationsModalOpen(false)}
                className="px-5 py-2 font-medium text-zinc-600 bg-white hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200 shadow-sm leading-none flex items-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Add New Drive</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddDrive} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Company *</label>
                <input 
                  required
                  type="text" 
                  value={newDrive.company}
                  onChange={(e) => setNewDrive({...newDrive, company: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Role *</label>
                <input 
                  required
                  type="text" 
                  value={newDrive.role}
                  onChange={(e) => setNewDrive({...newDrive, role: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Type *</label>
                  <select
                    value={newDrive.job_type}
                    onChange={(e) => setNewDrive({...newDrive, job_type: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Package</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 12 LPA"
                    value={newDrive.package}
                    onChange={(e) => setNewDrive({...newDrive, package: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Application Deadline</label>
                <input 
                  type="date" 
                  value={newDrive.deadline}
                  onChange={(e) => setNewDrive({...newDrive, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Eligible Branches (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. CS, IT"
                  value={newDrive.eligible_branches}
                  onChange={(e) => setNewDrive({...newDrive, eligible_branches: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Add Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
