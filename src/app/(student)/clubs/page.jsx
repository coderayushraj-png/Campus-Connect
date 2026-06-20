import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Code, 
  ArrowRight, 
  Link as LinkIcon, 
  Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most Members');
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState([]);

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    setFetching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('clubs')
        .select('*, profiles (id, name, avatar_url)')
        .order('member_count', { ascending: false });
      
      if (error) {
        console.error('Error fetching clubs:', error);
      } else {
        setClubs(data || []);
      }

      if (user) {
        const { data: memberships } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id);
        
        if (memberships) {
          setJoinedClubs(memberships.map(m => m.club_id));
        }
      }
    } catch (e) {
      console.error("Failed to load clubs or memberships", e);
    }
    setFetching(false);
  }

  const toggleJoin = async (clubId) => {
    if (clubId === 'gdsc-featured') return; // Cannot truly join the mock featured club banner unless we map it

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to join a club.");
        return;
      }

      const isJoined = joinedClubs.includes(clubId);
      if (isJoined) {
        // Leave
        const { error } = await supabase
          .from('club_members')
          .delete()
          .match({ user_id: user.id, club_id: clubId });
        
        if (!error) {
          setJoinedClubs(prev => prev.filter(id => id !== clubId));
          toast.success("You have left the club.");
        } else {
          toast.error("Failed to leave club.");
        }
      } else {
        // Join
        const { error } = await supabase
          .from('club_members')
          .insert({ user_id: user.id, club_id: clubId });
          
        if (error) {
          if (error.code === '23505') {
            toast.info("You are already a member!");
          } else {
            toast.error("Could not join the club. Table might not exist.");
          }
        } else {
          setJoinedClubs(prev => [...prev, clubId]);
          toast.success("Successfully joined the club!");
        }
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = (club.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    // For mock matching categories since tags might differ slightly, do a loose match or mapped match
    const tagToCategoryMap = {
      'Technical': ['technical', 'coding', 'tech'],
      'Cultural': ['cultural', 'art', 'dance', 'music'],
      'Sports': ['sports', 'athletics', 'fitness'],
      'Social': ['social', 'community', 'volunteering'],
      'Creative': ['creative', 'design', 'photography'],
      'Academic': ['academic', 'study', 'literature']
    };
    
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const clubCat = (club.category || '').toLowerCase();
      const mappedCats = tagToCategoryMap[selectedCategory] || [];
      matchesCategory = clubCat === selectedCategory.toLowerCase() || mappedCats.some(m => clubCat.includes(m));
    }
    
    const matchesJoined = showJoinedOnly ? joinedClubs.includes(club.id) : true;
    return matchesSearch && matchesCategory && matchesJoined;
  });

  const sortedClubs = [...filteredClubs].sort((a, b) => {
    if (sortBy === 'Most Members') {
      return (b.member_count || 0) - (a.member_count || 0);
    } else if (sortBy === 'Alphabetical (A-Z)') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'Newest First') {
      return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
    }
    return 0;
  });

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Social', 'Creative', 'Academic'];

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle/0 pt-2">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '30px' }}>
            Campus Clubs 🏫
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{clubs.length} active clubs on campus</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2 rounded-full font-label-md text-sm whitespace-nowrap shadow-sm transition-colors",
              selectedCategory === cat 
                ? "bg-surface-container-high text-on-surface font-semibold"
                : "border border-border-subtle bg-surface-white text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            {cat === 'All' ? 'All Clubs' : cat}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-surface-white p-3 rounded-xl border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-body-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" 
            placeholder="Search by name, category or coordinator..." 
            type="text" 
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full md:w-auto shrink-0">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 font-label-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer w-full sm:w-auto appearance-none"
          >
            <option>Most Members</option>
            <option>Newest First</option>
            <option>Alphabetical (A-Z)</option>
          </select>
          <div 
            onClick={() => setShowJoinedOnly(!showJoinedOnly)}
            className="flex items-center gap-3 px-4 py-2 border border-border-subtle rounded-lg bg-surface-container-low w-full sm:w-auto justify-between sm:justify-start cursor-pointer hover:bg-surface-container-highest transition-colors"
          >
            <span className="font-label-md text-sm text-on-surface-variant select-none">Joined Only</span>
            <div className={cn("w-9 h-5 rounded-full relative transition-colors duration-200", showJoinedOnly ? "bg-primary" : "bg-border-subtle")}>
              <span className={cn("absolute top-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200", showJoinedOnly ? "left-[18px]" : "left-[2px]")}></span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Club Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent-purple p-8 md:p-12 text-white shadow-md group">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 flex justify-end items-center pointer-events-none transition-transform duration-700 group-hover:scale-110">
          <Code className="w-[300px] h-[300px] -mr-20 text-white/50" strokeWidth={1} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-md p-4 shrink-0 flex items-center justify-center border border-white/20 shadow-inner group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow duration-500">
            <img 
              alt="GDSC Logo" 
              className="w-full h-full object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqbN0GQwXSrBTM4ZkDYlGF3Qkueh77ANCdJnFEPZMX2YhVolKALMheVOBGzQKMV4qLH5YBRy2a7e3b7Ou4ZIVnNjhVA8JHA9TGhczlAyerskxTzebbEcfojn0RAjQZU-YAmSdbxtiris6QvDROZtLMQqspyNdGZy9JPIZXaoFj0yQ1Rs_GuHSqHoll2ptYLoHRfyoNnXdx1BzuLs5oiKvVchZtP5LlMl2B_7Q5y9ZTD-zjcFJZuXJXCNOWJmMpHn9CQTwZ6Q9EkUA"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-[10px] uppercase font-bold tracking-widest backdrop-blur-sm shadow-sm inline-block">
              ⭐ Featured Club
            </span>
            <h3 className="font-headline-lg text-3xl font-bold mt-4 leading-tight">Google Developer Student Club</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 items-center">
              <span className="bg-white/10 px-4 py-1.5 rounded-full font-label-md text-sm border border-white/20 backdrop-blur-sm">Technical</span>
              <span className="flex items-center gap-1.5 font-label-md text-sm opacity-90 bg-black/10 px-3 py-1.5 rounded-full border border-white/10">
                <Users className="w-4 h-4" />
                1.2k members
              </span>
            </div>
            <button 
              onClick={() => {
                // Feature club action
                if(!joinedClubs.includes('gdsc-featured')) {
                  toggleJoin('gdsc-featured');
                }
              }}
              className="mt-8 bg-white text-primary px-6 py-2.5 rounded-lg font-label-md text-sm font-bold hover:bg-surface-container-low hover:shadow-lg transition-all shadow-md flex items-center gap-2 mx-auto md:mx-0 w-fit"
            >
              {joinedClubs.includes('gdsc-featured') ? 'Joined' : 'Join Club'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fetching ? (
          <div className="col-span-full py-8 text-center text-zinc-500">Loading clubs...</div>
        ) : sortedClubs.length === 0 ? (
          <div className="col-span-full py-8 text-center text-zinc-500">No clubs found matching your criteria.</div>
        ) : sortedClubs.map((club, idx) => (
          <ClubCard 
            key={club.id || idx}
            gradient={
              club.category === 'Technical' ? "from-[#10b981] to-[#6ee7b7]" :
              club.category === 'Cultural' ? "from-accent-orange to-[#fde68a]" :
              club.category === 'Sports' ? "from-primary to-accent-purple" :
              club.category === 'Social' ? "from-error to-[#fca5a5]" :
              club.category === 'Creative' ? "from-[#0f172a] to-[#475569]" :
              "from-[#0ea5e9] to-[#bae6fd]"
            }
            categoryColor={
              club.category === 'Technical' ? "text-[#059669]" :
              club.category === 'Cultural' ? "text-[#d97706]" :
              club.category === 'Sports' ? "text-primary" :
              club.category === 'Social' ? "text-error" :
              club.category === 'Creative' ? "text-[#1e293b]" :
              "text-[#0284c7]"
            }
            category={club.category || "General"}
            members={club.member_count?.toString() || "0"}
            title={club.name}
            desc={club.description}
            tag={`@${club.name?.toLowerCase().replace(/\s+/g, '_')}`}
            authorImg={club.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${club.profiles?.name || 'User'}`}
            authorName={club.profiles?.name || "Coordinator"}
            logoImg={club.logo_url}
            logoFallbackInitials={club.name ? club.name.substring(0, 2).toUpperCase() : "CB"}
            hasJoined={joinedClubs.includes(club.id)}
            onToggleJoin={() => toggleJoin(club.id)}
          />
        ))}
      </div>

      {/* Pagination / Load More */}
      {sortedClubs.length > 0 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-label-md text-sm text-on-surface-variant font-medium">Showing {sortedClubs.length} Clubs</p>
          <button className="px-8 py-2.5 border border-border-subtle bg-surface-white text-on-surface hover:text-primary rounded-lg font-label-md text-sm hover:bg-surface-container-low transition-colors shadow-sm">
            Load More Clubs
          </button>
        </div>
      )}
    </div>
  );
}

function ClubCard({ 
  gradient, category, categoryColor, members, 
  title, desc, tag, authorImg, authorName, 
  logoImg, logoFallbackInitials, hasJoined, onToggleJoin
}) {
  return (
    <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-border-subtle/80 transition-all duration-300 flex flex-col">
      <div className={cn("h-32 relative shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05)] bg-gradient-to-br", gradient)}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={cn("bg-white/95 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm", categoryColor)}>
            {category}
          </span>
          <span className="bg-black/30 backdrop-blur-md text-white px-2.5 py-1 rounded text-[10px] flex items-center gap-1 font-medium shadow-sm">
            <Users className="w-3 h-3" />
            {members}
          </span>
        </div>
      </div>
      
      <div className="px-5 pb-5 relative flex-1 flex flex-col">
        <div className="w-16 h-16 rounded-xl bg-surface-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] -mt-8 mb-4 p-1.5 border border-border-subtle/50 relative z-10 flex items-center justify-center">
          {logoImg ? (
            <img alt={title} className="w-full h-full object-cover rounded-lg" src={logoImg} />
          ) : (
            <span className="font-bold text-xl text-primary">{logoFallbackInitials}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-headline-sm text-xl font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{title}</h4>
          <span className="flex items-center gap-1.5 text-[#10b981] text-[10px] font-bold bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        
        <p className="text-body-sm text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed flex-1">
          {desc}
        </p>
        
        <div className="flex gap-2 mb-4">
          <span className="text-label-sm text-xs font-medium text-primary bg-primary/10 border border-primary/10 px-2 by-1 py-1 rounded-md flex items-center gap-1.5 w-fit">
            <LinkIcon className="w-3.5 h-3.5" />
            {tag}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-1">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-surface-container-high border border-border-subtle shrink-0">
              <img alt="Coordinator" className="w-full h-full rounded-full object-cover" src={authorImg} />
            </div>
            <span className="text-label-sm text-sm font-medium text-on-surface-variant line-clamp-1">{authorName}</span>
          </div>
          
          {hasJoined ? (
            <button onClick={onToggleJoin} className="bg-surface-container-low border border-border-subtle text-on-surface-variant px-4 py-1.5 rounded-lg font-label-md text-sm hover:bg-surface-white hover:text-on-surface transition-all flex items-center gap-1.5 font-semibold shrink-0 shadow-sm">
              <Check className="w-4 h-4 text-[#10b981]" />
              Joined
            </button>
          ) : (
            <button onClick={onToggleJoin} className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-1.5 border border-primary/20 hover:border-primary rounded-lg font-label-md text-sm transition-all font-semibold shrink-0 shadow-sm">
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
