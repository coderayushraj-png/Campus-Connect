import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Tag, MapPin, IdCard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTime, setSelectedTime] = useState('Any Time');
  const [myPostsOnly, setMyPostsOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [contactingItem, setContactingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setFetching(true);
    const { data, error } = await supabase
      .from('lost_found')
      .select('*, profiles (id, name, avatar_url)')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching lost & found items:', error);
    else setItems(data || []);
    setFetching(false);
  }

  const lostCount = items.filter(i => i.status === 'lost').length;
  const foundCount = items.filter(i => i.status === 'found').length;
  
  const filteredItems = items.filter(item => {
    if (activeTab && item.status !== activeTab) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.title?.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    if (selectedCategory !== 'All Categories') {
      if (item.category !== selectedCategory) return false;
    }
    
    if (selectedTime !== 'Any Time') {
      const itemDate = new Date(item.created_at || Date.now());
      const now = new Date();
      if (selectedTime === 'Today') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (selectedTime === 'This Week') {
        const diff = now - itemDate;
        if (diff > 7 * 24 * 60 * 60 * 1000) return false;
      }
    }
    
    // For my posts only, we'd need actual user session to compare. Mocking it here via just ignoring or doing basic filter.
    if (myPostsOnly) {
      // In a real app we would check `item.user_id === currentUser.id`
      return false; // Assuming none match as we mock 'myPostsOnly'
    }
    
    return true;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle/0 pt-2">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '30px' }}>
            Lost & Found <span className="text-3xl">🔍</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Help return items to their rightful owners. {items.length} items currently active.</p>
        </div>
        <button onClick={() => setIsReportModalOpen(true)} style={{ color: '#ffffff' }} className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm w-fit">
          <PlusCircle className="w-5 h-5" />
          Report Item
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-6 text-sm font-label-md text-on-surface-variant bg-surface-white p-4 rounded-xl border border-border-subtle shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error"></div>
          <span>{lostCount} Lost Items</span>
        </div>
        <div className="w-px h-4 bg-border-subtle hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
          <span>{foundCount} Found Items</span>
        </div>
        <div className="w-px h-4 bg-border-subtle hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
          <span>1,204 Claimed</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-subtle bg-surface-container-low rounded-lg text-body-sm font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
            placeholder="Search items..." 
            type="text"
          />
        </div>
        <div className="flex-1 w-full flex flex-wrap gap-4 items-center">
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-border-subtle text-on-surface bg-surface-white rounded-lg py-2 px-4 text-body-sm font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer appearance-none shadow-sm"
          >
            <option>All Categories</option>
            <option>Electronics</option>
            <option>ID & Cards</option>
            <option>Clothing</option>
            <option>General</option>
          </select>
          <select 
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            className="border border-border-subtle text-on-surface bg-surface-white rounded-lg py-2 px-4 text-body-sm font-body-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer appearance-none shadow-sm"
          >
            <option>Any Time</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto whitespace-nowrap bg-surface-container-low py-2 px-3 rounded-lg border border-border-subtle">
          <input 
            checked={myPostsOnly}
            onChange={(e) => setMyPostsOnly(e.target.checked)}
            className="rounded border-border-subtle text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
            id="my-posts" 
            type="checkbox"
          />
          <label className="font-label-sm text-sm text-on-surface cursor-pointer select-none" htmlFor="my-posts">My Posts Only</label>
        </div>
      </div>

      {/* Status Toggles */}
      <div className="flex border-b border-border-subtle w-full">
        <button 
          onClick={() => setActiveTab('lost')}
          className={cn(
            "flex-1 py-4 font-headline-sm text-lg font-semibold transition-colors border-b-2",
            activeTab === 'lost' 
              ? "text-error border-error bg-error/5" 
              : "text-on-surface-variant border-transparent hover:bg-surface-white"
          )}
        >
          Lost Items ({lostCount})
        </button>
        <button 
          onClick={() => setActiveTab('found')}
          className={cn(
            "flex-1 py-4 font-headline-sm text-lg font-semibold transition-colors border-b-2",
            activeTab === 'found'
              ? "text-[#10b981] border-[#10b981] bg-[#10b981]/5"
              : "text-on-surface-variant border-transparent hover:bg-surface-white"
          )}
        >
          Found Items ({foundCount})
        </button>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {fetching ? (
          <div className="col-span-full py-8 text-center text-zinc-500">Loading items...</div>
        ) : displayedItems.length === 0 ? (
          <div className="col-span-full py-8 text-center text-zinc-500">No items found matching your filters.</div>
        ) : displayedItems.map((item, idx) => (
          <LostFoundCard 
            key={item.id || idx}
            type={item.status}
            category={item.category || "General"}
            title={item.title}
            desc={item.description}
            location={item.location_found || "Unknown Location"}
            authorInit={item.profiles?.name ? item.profiles.name.substring(0, 2).toUpperCase() : "US"}
            authorName={item.profiles?.name || "Student"}
            time={new Date(item.created_at || Date.now()).toLocaleDateString()}
            authorColor={item.status === 'lost' ? "bg-error/20 text-error" : "bg-[#10b981]/20 text-[#10b981]"}
            imageUrl={item.image_url}
            fallbackIcon={IdCard}
            onActionClick={() => setContactingItem(item)}
          />
        ))}
      </div>

      {/* Pagination */}
      {filteredItems.length > visibleCount && (
        <div className="flex justify-center mt-8 pt-6 border-t border-border-subtle">
          <button 
            onClick={() => setVisibleCount(v => v + 6)}
            className="border border-border-subtle bg-surface-white text-on-surface px-6 py-2.5 rounded-lg font-label-md hover:bg-surface-container-low transition-colors shadow-sm"
          >
            Load More Items
          </button>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsReportModalOpen(false)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle bg-surface-container-lowest">
              <h2 className="font-headline-md text-xl font-bold text-on-surface">Report Item</h2>
              <p className="font-body-sm text-sm text-on-surface-variant mt-1">Found something or lost something? Let the campus know.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 font-label-sm text-sm text-on-surface cursor-pointer">
                  <input type="radio" name="status" defaultChecked className="text-primary focus:ring-primary w-4 h-4"/> Lost something
                </label>
                <label className="flex items-center gap-2 font-label-sm text-sm text-on-surface cursor-pointer">
                  <input type="radio" name="status" className="text-primary focus:ring-primary w-4 h-4"/> Found something
                </label>
              </div>

              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1.5">Item Title</label>
                <input className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Blue Water Bottle" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-sm text-on-surface mb-1.5">Category</label>
                  <select className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none">
                    <option>Electronics</option>
                    <option>ID & Cards</option>
                    <option>Clothing</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-sm text-on-surface mb-1.5">Location</label>
                  <input className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Library 2nd Floor" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1.5">Description</label>
                <textarea className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[80px] resize-y" placeholder="Any distinguishing marks..."></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
              <button 
                onClick={() => setIsReportModalOpen(false)} 
                className="px-6 py-2.5 bg-surface-container-low border border-border-subtle hover:bg-surface-container text-on-surface font-label-md text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setContactingItem(null); // Instead of alert, just close for now
                  // In a real app we'd submit to an API
                  setIsReportModalOpen(false);
                }} 
                className="px-6 py-2.5 bg-primary text-white hover:brightness-110 font-label-md text-sm rounded-lg transition-all"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setContactingItem(null)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle bg-surface-container-lowest flex justify-between items-center">
              <div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">Contact {contactingItem.profiles?.name || 'Student'}</h2>
                <p className="font-body-sm text-sm text-on-surface-variant mt-1">Regarding: {contactingItem.title}</p>
              </div>
              <button onClick={() => setContactingItem(null)} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1.5">Message</label>
                <textarea 
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-3 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] resize-y" 
                  placeholder={`Hi ${contactingItem.profiles?.name || 'there'},\n\nI think this is mine / I think I found this...`}
                  autoFocus
                ></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
              <button 
                onClick={() => setContactingItem(null)} 
                className="px-5 py-2.5 bg-surface-container-low border border-border-subtle hover:bg-surface-container text-on-surface font-label-md text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setContactingItem(null);
                }} 
                className="px-5 py-2.5 bg-primary text-white hover:brightness-110 font-label-md text-sm rounded-lg transition-all"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LostFoundCard({ 
  type, category, title, desc, location, authorInit, authorName, time, authorColor, imageUrl, fallbackIcon: FallbackIcon, onActionClick
}) {
  const isLost = type === 'lost';

  return (
    <div className="bg-surface-white border border-border-subtle rounded-xl flex flex-col overflow-hidden hover:-translate-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] transition-transform duration-300 group relative cursor-pointer">
      <div className={cn("h-[180px] w-full relative flex items-center justify-center overflow-hidden shrink-0", 
        !imageUrl ? (isLost ? "bg-gradient-to-br from-error/20 to-error/5" : "bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5") : "bg-surface-container-low"
      )}>
        {imageUrl ? (
          <img alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={imageUrl}/>
        ) : (
          FallbackIcon && <FallbackIcon className={cn("w-20 h-20 opacity-40", isLost ? "text-error" : "text-[#10b981]")} strokeWidth={1.5} />
        )}
        
        <div className={cn("absolute top-3 left-3 font-label-sm text-xs px-2.5 py-1 rounded border uppercase tracking-wider backdrop-blur-md font-bold", 
          isLost ? "bg-error text-white border-error/50" : "bg-[#10b981] text-white border-[#10b981]/50"
        )}>
          {isLost ? "Lost" : "Found"}
        </div>
        
        <div className="absolute bottom-3 left-3 bg-white/90 text-on-surface font-label-sm text-xs px-2.5 py-1 rounded backdrop-blur-md flex items-center gap-1.5 shadow-sm border border-white/20">
          <Tag className="w-3.5 h-3.5 opacity-70" /> 
          {category}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-headline-sm text-xl font-bold text-on-surface truncate group-hover:text-primary transition-colors">{title}</h3>
        <p className="font-body-sm text-sm text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">{desc}</p>
        
        <div className="flex items-center gap-2 mt-4 text-on-surface-variant font-label-sm text-sm">
          <MapPin className="w-4 h-4 shrink-0 text-text-muted" />
          <span className="truncate">{location}</span>
        </div>
        
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs", authorColor)}>
              {authorInit}
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-sm text-on-surface leading-tight">{authorName}</span>
              <span className="text-[10px] text-text-muted">{time}</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onActionClick && onActionClick();
            }}
            className={cn("font-label-md text-sm px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-sm", 
            isLost 
              ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10" 
              : "bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border border-[#10b981]/10"
          )}>
            {isLost ? "I Found This!" : "This is Mine!"}
          </button>
        </div>
      </div>
    </div>
  );
}
