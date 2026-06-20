import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Clock, MapPin, Grid, List, Plus, Filter, ArrowUp, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [filterType, setFilterType] = useState('All Time');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState({ show: false, title: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setFetching(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) console.error('Error fetching events:', error);
    else setEvents(data || []);
    setFetching(false);
  }

  const handleRegister = async () => {
    if (!selectedEvent) return;
    setIsRegistering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to register.");
        setIsRegistering(false);
        return;
      }
      
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: selectedEvent.id,
          user_id: user.id
        });
        
      if (error) {
        if (error.code === '23505') {
          toast.info("You're already registered for this event!");
        } else if (error.code === '42P01') {
          toast.error("Database table 'event_registrations' is missing. Please contact Admin.");
        } else {
          toast.error("Could not complete registration.");
        }
      } else {
        // Success
        setShowSuccessModal({ show: true, title: selectedEvent.title });
        setSelectedEvent(null);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const categories = ['All Events', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Tech'];

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== 'All Events') {
      const typeStr = (event.event_type || '').toLowerCase();
      if (!typeStr.includes(selectedCategory.toLowerCase())) return false;
    }
    
    if (filterType === 'Soonest') {
      const now = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) return false; // "Soonest" means next 7 days here
    }
    return true;
  });

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col gap-stack-lg pb-12">
      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle/0">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '30px' }}>
            Events & Announcements
            <span className="text-2xl">📅</span>
          </h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">{filteredEvents.length} upcoming events on campus</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container border border-border-subtle rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} aria-label="Grid view" className={cn("w-8 h-8 flex items-center justify-center rounded transition-colors", viewMode === 'grid' ? "bg-surface-white shadow-sm text-primary" : "text-text-muted hover:text-on-surface")}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} aria-label="List view" className={cn("w-8 h-8 flex items-center justify-center rounded transition-colors", viewMode === 'list' ? "bg-surface-white shadow-sm text-primary" : "text-text-muted hover:text-on-surface")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs & Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-2 w-full lg:w-auto">
          {categories.map(category => (
            <button 
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-colors border",
                selectedCategory === category 
                  ? "bg-on-surface text-surface-white border-transparent shadow-sm" 
                  : "bg-surface-white text-text-muted border-border-subtle hover:border-outline-variant hover:text-on-surface"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setFilterType('All Time')}
            className={cn("px-3 py-2 border rounded-lg flex items-center gap-2 font-label-md text-label-md transition-colors", filterType === 'All Time' ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-white text-text-muted border-border-subtle hover:text-on-surface")}
          >
            <Filter className="w-4 h-4" />
            All Time
          </button>
          <button 
            onClick={() => setFilterType('Soonest')}
            className={cn("px-3 py-2 border rounded-lg flex items-center gap-2 font-label-md text-label-md transition-colors", filterType === 'Soonest' ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-white text-text-muted border-border-subtle hover:text-on-surface")}
          >
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Soonest
          </button>
        </div>
      </div>

      {/* Featured Hero Banner */}
      <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white p-6 sm:p-8 md:p-10 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)]">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMC4yIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] bg-no-repeat bg-right-bottom opacity-50 mix-blend-overlay hidden md:block"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/10 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
              <span className="font-label-sm text-[11px] tracking-wider font-bold uppercase">Happening Soon</span>
            </div>
            
            <h2 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight drop-shadow-sm">National Tech Symposium 2026</h2>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 font-body-md text-white/90">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 opacity-80" />
                <span>Today • 2:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 opacity-80" />
                <span>Auditorium, Block A</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
            <div className="flex gap-2 text-center">
              <TimeBox val="12" label="Hrs" />
              <div className="text-2xl font-bold py-2 opacity-50">:</div>
              <TimeBox val="45" label="Min" />
              <div className="text-2xl font-bold py-2 opacity-50">:</div>
              <TimeBox val="30" label="Sec" />
            </div>
            <button 
              onClick={() => setSelectedEvent({
                title: "National Tech Symposium 2026",
                date: new Date().toISOString(),
                venue: "Auditorium, Block A",
                description: "The biggest tech event of the year featuring discussions on AI, ML, Web3 and robotics.",
                event_type: "Tech",
                is_paid: false
              })}
              className="bg-white text-[#4f46e5] font-label-md text-base px-6 py-3 rounded-xl font-bold hover:bg-surface-container-low transition-colors shadow-lg w-full md:w-auto"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid / List */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
      )}>
        {fetching ? (
          <div className="col-span-full py-8 text-center text-zinc-500">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full py-8 text-center text-zinc-500">No events found.</div>
        ) : filteredEvents.map((event, i) => (
          <EventCard
            key={event.id || i}
            viewMode={viewMode}
            category={event.event_type}
            bgGrad="from-indigo-50 to-purple-50"
            tagColor="bg-primary/10 text-primary border-primary/20"
            title={event.title}
            time={new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            location={event.venue || 'TBA'}
            desc={event.description}
            dept="General"
            deptInit="GN"
            deptBg="bg-secondary-container text-on-secondary-container"
            status={new Date(event.date).toLocaleDateString()}
            isUpcoming={true}
            price={event.is_paid ? `₹${event.fee}` : "Free"}
            onRegister={() => setSelectedEvent(event)}
          />
        ))}
      </div>

      {/* Register/Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedEvent(null)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle bg-surface-container-lowest flex justify-between items-start">
              <div>
                <span className="inline-block px-2.5 py-1 font-label-sm text-xs rounded-full bg-primary/10 text-primary border border-primary/20 mb-2">{selectedEvent.event_type || 'Event'}</span>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">{selectedEvent.title}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-3 font-body-sm text-on-surface">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-text-muted" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString()} at {new Date(selectedEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-text-muted" />
                  <span>{selectedEvent.venue || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-text-muted">payments</span>
                  <span>{selectedEvent.is_paid ? `Registration Fee: ₹${selectedEvent.fee}` : "Free Registration"}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-subtle">
                <h4 className="font-label-md mb-2 text-on-surface">About the Event</h4>
                <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">{selectedEvent.description || 'No description available for this event.'}</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="px-5 py-2.5 bg-surface-container-low border border-border-subtle hover:bg-surface-container text-on-surface font-label-md text-sm rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                disabled={isRegistering}
                onClick={handleRegister} 
                className="px-5 py-2.5 bg-primary text-white hover:brightness-110 font-label-md text-sm rounded-lg transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isRegistering ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                {selectedEvent.is_paid ? 'Pay & Register' : 'Register Now'}
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
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Registration Successful</h3>
            <p className="font-body-md text-on-surface-variant mb-6">
              You've successfully registered for <strong>{showSuccessModal.title}</strong>. We'll send you an email confirmation shortly.
            </p>
            <button 
              onClick={() => setShowSuccessModal({ show: false, title: "" })} 
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

function TimeBox({ val, label }) {
  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 min-w-[60px]">
      <div className="font-headline-lg text-2xl font-bold font-mono">{val}</div>
      <div className="font-label-sm text-[10px] text-white/70 uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function EventCard({
  category, bgGrad, tagColor, title, time, location, desc, dept, deptInit, deptBg, status, price, isUpcoming, titleHover, onRegister, viewMode = 'grid'
}) {
  return (
    <div className={cn(
      "bg-surface-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-border-subtle group hover:-translate-y-1 transition-transform duration-300 flex",
      viewMode === 'grid' ? "flex-col h-[400px]" : "flex-row h-auto items-stretch"
    )}>
      <div className={cn("bg-gradient-to-br relative p-4 flex flex-col justify-between items-start overflow-hidden shrink-0 border-border-subtle", 
        bgGrad,
        viewMode === 'grid' ? "h-[140px] flex-row items-start border-b" : "w-48 border-r"
      )}>
        <div className="relative z-10 flex flex-col gap-2">
          <span className={cn("px-2.5 py-1 font-label-sm text-xs rounded-full w-max border", tagColor)}>{category}</span>
        </div>
        <div className={cn("relative z-10 flex gap-2", viewMode === 'grid' ? "flex-col items-end" : "flex-col mt-4")}>
          <span className={cn("px-2.5 py-1 font-label-sm text-xs rounded-full border border-border-subtle flex items-center gap-1 w-max", 
            isUpcoming ? "bg-error-container text-on-error-container border-error/20" : "bg-surface-container text-on-surface"
          )}>
            {isUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>}
            {status}
          </span>
          <span className="px-2.5 py-1 bg-surface-white text-on-surface font-label-sm text-xs rounded-full shadow-sm border border-border-subtle font-bold w-max">{price}</span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow gap-4">
        <div>
          <h3 className={cn("font-headline-md text-xl font-bold text-on-surface line-clamp-2 leading-tight transition-colors", titleHover || "group-hover:text-primary")}>
            {title}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 mt-3 text-text-muted font-body-sm text-sm">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {time}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {location}</div>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 flex-grow">{desc}</p>
        
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-[10px]", deptBg)}>
              {deptInit}
            </div>
            <span className="font-label-sm text-xs text-text-muted">{dept}</span>
          </div>
          <button onClick={onRegister} className={cn("font-label-md text-sm flex items-center gap-1 transition-colors font-semibold ", 
            titleHover ? titleHover.replace('group-hover:', '') : "text-primary hover:text-tertiary group-hover:gap-2"
          )}>
            Register <ArrowUp className="w-4 h-4 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
