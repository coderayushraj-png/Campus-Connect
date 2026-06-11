import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  Search, 
  ArrowUpDown,
  FileText,
  Briefcase,
  PartyPopper,
  BookOpen,
  ExternalLink,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Notices() {
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [notices, setNotices] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [importantOnly, setImportantOnly] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    setFetching(true);
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching notices:', error);
    else setNotices(data || []);
    setFetching(false);
  }

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = (notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          notice.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesType = true;
    if (selectedType !== 'All') {
      const typeStr = (notice.notice_type || '').toLowerCase();
      matchesType = typeStr === selectedType.toLowerCase() || typeStr.includes(selectedType.toLowerCase());
      if (selectedType === 'Events' && typeStr.includes('event')) matchesType = true;
    }

    const matchesImportant = importantOnly ? (notice.is_important === true || notice.is_important === 'true') : true;

    return matchesSearch && matchesType && matchesImportant;
  });

  const sortedNotices = [...filteredNotices].sort((a, b) => {
    const dateA = new Date(a.created_at || Date.now());
    const dateB = new Date(b.created_at || Date.now());
    if (sortOrder === 'newest') return dateB - dateA;
    return dateA - dateB;
  });

  return (
    <div className="relative w-full h-full min-h-screen">
      <div className={cn(
        "max-w-[1280px] mx-auto w-full space-y-6 pb-12 transition-all duration-300"
      )}>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle/0 pt-2">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2 font-bold text-[30px]">
              Official Notices <span className="text-[28px]">📢</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Showing {sortedNotices.length} active communications from university administration.
            </p>
          </div>
        </div>

        {/* Important Notice Banner */}
        <div className="bg-gradient-to-r from-error/90 to-error text-white rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-error/20 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-start sm:items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-full shrink-0">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-headline-sm text-lg font-bold">URGENT: Campus Closure Due to Severe Weather</h2>
              <p className="font-body-sm text-sm text-white/90 mt-1">All classes and administrative operations are suspended for Tuesday, Nov 14th. Please stay indoors.</p>
            </div>
          </div>
          <button onClick={() => setSelectedNotice({
            title: 'URGENT: Campus Closure Due to Severe Weather',
            content: 'All classes and administrative operations are suspended for Tuesday, Nov 14th. Please stay indoors.',
            category: 'Urgent',
            date: 'Today',
            notice_type: 'Urgent'
          })} className="whitespace-nowrap border border-white/50 bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 font-label-md text-sm transition-colors shrink-0">
            View Notice
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-white border border-border-subtle rounded-xl p-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-grow lg:flex-grow-0 w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg font-body-sm text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="Search notices..." type="text"/>
            </div>
            <div className="h-6 w-px bg-border-subtle hidden lg:block mx-1"></div>
            {/* Type Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar w-full lg:w-auto">
              {['All', 'Academic', 'Placement', 'Events'].map(type => (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "rounded-lg px-4 py-1.5 font-label-sm text-sm transition-colors whitespace-nowrap shadow-sm",
                    selectedType === type
                      ? "bg-primary text-white border border-primary"
                      : "bg-surface-white text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-border-subtle"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t border-border-subtle lg:border-none pt-3 lg:pt-0">
            {/* Date Sort */}
            <button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} className="flex items-center gap-2 text-on-surface-variant font-label-md text-sm hover:text-on-surface transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
            <div className="h-6 w-px bg-border-subtle mx-1"></div>
            {/* Important Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input className="sr-only peer" type="checkbox" checked={importantOnly} onChange={(e) => setImportantOnly(e.target.checked)} />
                <div className="w-9 h-5 bg-surface-container-high border border-border-subtle rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
              </div>
              <span className="font-label-sm text-sm text-on-surface-variant group-hover:text-on-surface transition-colors select-none">Important Only</span>
            </label>
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {fetching ? (
            <div className="col-span-full text-center text-zinc-500 py-8">Loading notices...</div>
          ) : sortedNotices.length === 0 ? (
            <div className="col-span-full text-center text-zinc-500 py-8">No notices available.</div>
          ) : sortedNotices.map((notice, idx) => (
             <NoticeCard 
               key={notice.id || idx}
               colorLine={notice.is_important ? "bg-error" : "bg-[#f59e0b]"}
               icon={notice.notice_type === 'placement' ? Briefcase : notice.notice_type === 'holiday' ? PartyPopper : FileText}
               iconBg={notice.is_important ? "bg-error/10 text-error" : "bg-[#fef3c7] text-[#d97706]"}
               badge={notice.is_important ? "Important" : ""}
               badgeColor="bg-error/10 text-error border-error/20"
               category={notice.notice_type || "General"}
               date={new Date(notice.created_at || Date.now()).toLocaleDateString()}
               title={notice.title}
               desc={notice.content}
               primaryAction="View Details"
               primaryIcon={FileText}
               onClick={() => setSelectedNotice(notice)}
             />
          ))}
        </div>
      </div>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedNotice(null)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-border-subtle bg-surface-container-lowest">
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-3">
                   <span className="text-on-surface-variant font-label-sm text-xs font-semibold px-2 py-1 bg-surface-container-low rounded-md">
                     {selectedNotice.notice_type || selectedNotice.category || 'General'}
                   </span>
                   <span className="text-on-surface-variant font-label-sm text-xs border border-border-subtle px-2 py-1 rounded-md">
                     {selectedNotice.created_at ? new Date(selectedNotice.created_at).toLocaleDateString() : (selectedNotice.date || 'Today')}
                   </span>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface leading-tight text-balance">{selectedNotice.title}</h2>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant shrink-0 border border-transparent hover:border-border-subtle">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="prose prose-zinc max-w-none text-on-surface-variant font-body-md text-base leading-relaxed whitespace-pre-wrap">
                {selectedNotice.content || selectedNotice.desc}
              </div>
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
              <button onClick={() => setSelectedNotice(null)} className="px-6 py-2.5 bg-surface-container-low border border-border-subtle hover:bg-surface-container text-on-surface font-label-md text-sm rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoticeCard({
  colorLine, icon: Icon, iconBg, badge, badgeColor, category, date, title, desc, primaryAction, primaryIcon: PrimaryIcon, onClick
}) {
  return (
    <article className="bg-surface-white border border-border-subtle rounded-xl p-5 flex flex-col gap-4 relative group hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-outline-variant transition-all duration-300 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className={cn("absolute top-0 left-0 w-1.5 h-full", colorLine)}></div>
      
      <div className="flex items-start justify-between gap-2 pl-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg flex items-center justify-center shadow-sm", iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
          {badge ? (
            <span className={cn("border rounded-md px-1.5 py-0.5 font-label-sm text-[10px] tracking-wider uppercase font-bold", badgeColor)}>
              {badge}
            </span>
          ) : (
            <span className="text-on-surface-variant font-label-sm text-xs font-semibold">{category}</span>
          )}
        </div>
        <span className="font-label-sm text-xs text-on-surface-variant whitespace-nowrap bg-surface-container-low px-2 py-1 rounded-md">{date}</span>
      </div>
      
      <div className="flex flex-col gap-2 flex-grow pl-3">
        <h3 className="font-headline-sm text-lg font-bold text-on-surface line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <p className="font-body-sm text-sm text-on-surface-variant line-clamp-3 leading-relaxed mt-1">
          {desc}
        </p>
      </div>
      
      <div className="flex items-center gap-3 pt-4 border-t border-border-subtle mt-1 pl-3">
        <button onClick={onClick} className="flex-1 bg-surface-white border border-border-subtle text-on-surface hover:bg-surface-container-low rounded-lg px-3 py-2 flex items-center justify-center gap-2 font-label-md text-sm font-medium transition-colors shadow-sm">
          <PrimaryIcon className="w-4 h-4 opacity-70" />
          {primaryAction}
        </button>
      </div>
    </article>
  );
}
