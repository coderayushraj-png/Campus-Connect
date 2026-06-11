import React, { useState, useEffect } from 'react';
import { Info, Search, Bookmark, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Placement() {
  const [placements, setPlacements] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleType, setRoleType] = useState('All Roles'); // 'All Roles', 'Full Time', 'Internship'
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [sortBy, setSortBy] = useState('Sort: Deadline'); // 'Sort: Newest', 'Sort: Deadline'

  const [bookmarked, setBookmarked] = useState({});
  const [selectedDrive, setSelectedDrive] = useState(null); // For Details / Apply modal
  
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState({ show: false, company: "", role: "" });

  useEffect(() => {
    fetchPlacements();
  }, []);

  async function fetchPlacements() {
    setFetching(true);
    const { data, error } = await supabase
      .from('placements')
      .select('*')
      .order('created_at', { ascending: false }); // Fetch all, we'll sort them on client for flexibility
    
    // We filter deadline on client for simplicity since we fetched all recent
    if (error) console.error('Error fetching placements:', error);
    else {
      setPlacements(data || []);
    }
    setFetching(false);
  }

  const handleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = async () => {
    if (!selectedDrive) return;
    setIsApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to apply.");
        setIsApplying(false);
        return;
      }
      
      const { error } = await supabase
        .from('placement_applications')
        .insert({
          placement_id: selectedDrive.id,
          user_id: user.id
        });
        
      if (error) {
        if (error.code === '23505') {
          toast.info("You've already applied for this drive!");
        } else if (error.code === '42P01') {
          toast.error("Database table 'placement_applications' is missing. Please contact Admin.");
        } else {
          toast.error("Could not complete application.");
        }
      } else {
        // Success
        setShowSuccessModal({ show: true, company: selectedDrive.company, role: selectedDrive.role });
        setSelectedDrive(null);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const filteredPlacements = placements.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.company?.toLowerCase().includes(q) && !p.role?.toLowerCase().includes(q)) return false;
    }
    
    if (roleType !== 'All Roles') {
      const typeStr = p.job_type === 'internship' ? 'Internship' : 'Full Time';
      if (typeStr !== roleType) return false;
    }

    if (branchFilter !== 'All Branches') {
      if (Array.isArray(p.eligible_branches) && !p.eligible_branches.includes(branchFilter)) {
        return false;
      }
    }
    
    return true;
  });

  const sortedPlacements = [...filteredPlacements].sort((a, b) => {
    if (sortBy === 'Sort: Deadline') {
      return new Date(a.deadline) - new Date(b.deadline);
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle/0 pt-2">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '30px' }}>
            Placement Hub
            <span className="text-3xl">🎓</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{placements.length} active opportunities for you</p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Drives" value={placements.length} />
        <StatCard title="Active Now" value={placements.length} colorClass="border-[#10b981] text-[#10b981]" />
        <StatCard title="Closing This Week" value={placements.filter(d => {
          const diffDays = Math.ceil(Math.abs(new Date(d.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }).length} colorClass="border-[#f59e0b] text-[#f59e0b]" />
        <StatCard title="Companies Visited" value="86" />
      </div>

      {/* Eligibility Notice */}
      <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-lg flex items-start gap-4">
        <Info className="text-[#d97706] mt-0.5 w-5 h-5 shrink-0" />
        <div>
          <div className="font-label-md text-label-md text-[#b45309] font-bold mb-1">Eligibility Filtering Active</div>
          <div className="font-body-sm text-body-sm text-[#92400e]">
            Showing drives matching your current profile: <strong>B.Tech Computer Science</strong> with <strong>8.4 CGPA</strong>.
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-sm text-body-sm transition-all shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]" 
            placeholder="Search company or role..." 
            type="text"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto hide-scrollbar">
          {['All Roles', 'Full Time', 'Internship'].map(role => (
            <button 
              key={role}
              onClick={() => setRoleType(role)}
              className={cn(
                "px-4 py-2 rounded-lg font-label-sm text-label-sm whitespace-nowrap shadow-sm transition-colors",
                roleType === role 
                  ? "bg-primary-container text-on-primary-container border border-primary-container"
                  : "bg-surface-white text-on-surface border border-border-subtle hover:bg-surface-container"
              )}
            >
              {role}
            </button>
          ))}
          <div className="w-px bg-border-subtle my-1 mx-1 hidden lg:block"></div>
          <select 
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="bg-surface-white border border-border-subtle rounded-lg px-4 py-2 font-label-sm text-label-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm cursor-pointer appearance-none"
          >
            <option>All Branches</option>
            <option>CSE</option>
            <option>ECE</option>
          </select>
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-surface-white border border-border-subtle rounded-lg px-4 py-2 font-label-sm text-label-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm cursor-pointer appearance-none"
          >
            <option>Sort: Newest</option>
            <option>Sort: Deadline</option>
          </select>
        </div>
      </div>

      {/* Placement Cards Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {fetching ? (
          <div className="col-span-full py-8 text-center text-zinc-500">Loading placement drives...</div>
        ) : sortedPlacements.length === 0 ? (
          <div className="col-span-full py-8 text-center text-zinc-500">No active placement drives found.</div>
        ) : sortedPlacements.map((drive, i) => {
          const diffTime = Math.abs(new Date(drive.deadline) - new Date());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const urgencyColor = diffDays <= 3 ? "bg-[#ef4444]" : diffDays <= 7 ? "bg-[#f59e0b]" : "bg-[#10b981]";
          const urgencyTextColor = diffDays <= 3 ? "text-[#ef4444]" : diffDays <= 7 ? "text-[#d97706]" : "text-[#059669]";

          return (
            <PlacementCard 
              key={drive.id || i}
              urgencyColor={urgencyColor}
              urgencyText={`Closes in ${diffDays} days`}
              urgencyTextColor={urgencyTextColor}
              init={drive.company?.charAt(0).toUpperCase() || 'C'}
              role={drive.role}
              company={drive.company}
              type={drive.job_type === 'internship' ? 'Internship' : 'Full Time'}
              salary={drive.package || 'TBD'}
              branches={Array.isArray(drive.eligible_branches) ? drive.eligible_branches.join(', ') : 'All'}
              cgpa={`Min ${drive.eligibility_cgpa} CGPA`}
              isBookmarked={bookmarked[drive.id]}
              onBookmark={(e) => handleBookmark(e, drive.id)}
              onDetails={() => setSelectedDrive(drive)}
              onApply={() => setSelectedDrive(drive)}
            />
          );
        })}
      </div>

      {/* Details/Apply Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDrive(null)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle bg-surface-container-lowest">
              <h2 className="font-headline-md text-xl font-bold text-on-surface">{selectedDrive.role} at {selectedDrive.company}</h2>
              <p className="font-body-sm text-sm text-on-surface-variant mt-1">
                Deadline: {new Date(selectedDrive.deadline).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-label-md text-sm text-on-surface mb-1 text-on-surface-variant uppercase">Package Details</h4>
                <p className="text-body-md text-sm text-on-surface">{selectedDrive.package || 'To be discussed'}</p>
              </div>

              <div>
                <h4 className="font-label-md text-sm text-on-surface mb-1 text-on-surface-variant uppercase">Eligibility</h4>
                <p className="text-body-md text-sm text-on-surface">Min CGPA: {selectedDrive.eligibility_cgpa}</p>
                <p className="text-body-md text-sm text-on-surface mt-1">Branches: {Array.isArray(selectedDrive.eligible_branches) ? selectedDrive.eligible_branches.join(', ') : 'All Branches'}</p>
              </div>

              {selectedDrive.description && (
                <div>
                  <h4 className="font-label-md text-sm text-on-surface mb-1 text-on-surface-variant uppercase">About Role</h4>
                  <p className="text-body-md text-sm text-on-surface whitespace-pre-wrap">{selectedDrive.description}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
              <button 
                onClick={() => setSelectedDrive(null)} 
                className="px-6 py-2.5 bg-surface-container-low border border-border-subtle hover:bg-surface-container text-on-surface font-label-md text-sm rounded-lg transition-colors"
                disabled={isApplying}
              >
                Close
              </button>
              <button 
                onClick={handleApply} 
                disabled={isApplying}
                className="px-6 py-2.5 bg-primary text-white hover:brightness-110 font-label-md text-sm rounded-lg transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isApplying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                Confirm Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center">
            <div className="w-16 h-16 bg-success-container rounded-full flex items-center justify-center mb-4 text-on-success-container">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Application Submitted!</h3>
            <p className="font-body-md text-on-surface-variant mb-6">
              You've successfully applied for the <strong>{showSuccessModal.role}</strong> role at <strong>{showSuccessModal.company}</strong>. Keep an eye on your email for further instructions.
            </p>
            <button 
              onClick={() => setShowSuccessModal({ show: false, company: "", role: "" })} 
              className="w-full px-5 py-3 bg-primary text-white hover:brightness-110 font-label-md text-base rounded-xl transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, colorClass }) {
  return (
    <div className={cn("bg-surface-white border border-border-subtle p-5 rounded-xl flex flex-col gap-1 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]", colorClass)}>
      <div className={cn("text-on-surface-variant font-label-sm text-label-sm uppercase", colorClass && "text-inherit")}>{title}</div>
      <div className={cn("font-headline-lg text-headline-lg text-on-surface", colorClass && "text-inherit")}>{value}</div>
    </div>
  );
}

function PlacementCard({
  urgencyColor, urgencyText, urgencyTextColor, init, role, company, type, salary, branches, cgpa,
  isBookmarked, onBookmark, onDetails, onApply
}) {
  return (
    <div className="bg-surface-white border border-border-subtle rounded-xl relative flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", urgencyColor)}></div>
      <div className="p-5 pl-7 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center font-headline-sm text-2xl text-primary font-bold">
              {init}
            </div>
            <div>
              <h3 className="font-headline-sm text-xl font-bold text-on-surface leading-tight transition-colors group-hover:text-primary">{role}</h3>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{company}</div>
            </div>
          </div>
          <button onClick={onBookmark} className={cn("transition-colors p-1 rounded-md", isBookmarked ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/5")}>
            <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-label-sm text-xs">{type}</span>
          <span className="bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0] px-2.5 py-1 rounded-md font-label-sm text-xs flex items-center gap-1">
            ₹ {salary}
          </span>
          <span className="bg-surface-container border border-border-subtle text-on-surface-variant px-2.5 py-1 rounded-md font-label-sm text-xs">{branches}</span>
          <span className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-2.5 py-1 rounded-md font-label-sm text-xs">{cgpa}</span>
        </div>
        
        <div className="mt-auto border-t border-border-subtle pt-4 flex items-center justify-between">
          <div className={cn("flex items-center gap-1 font-label-sm text-xs", urgencyTextColor)}>
            <Clock className="w-4 h-4" />
            {urgencyText}
          </div>
          <div className="flex gap-3">
            <button onClick={onDetails} className="text-on-surface font-label-md text-sm hover:underline transition-all px-2">Details</button>
            <button onClick={onApply} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-sm hover:bg-tertiary transition-colors shadow-sm">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
