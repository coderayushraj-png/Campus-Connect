import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  MessageSquare, 
  CheckCircle, 
  BookOpen, 
  Users, 
  Pin, 
  Flame,
  Search,
  ChevronDown,
  Filter,
  ChevronUp,
  Share2,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('New');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedTag, setSelectedTag] = useState('Filter by Tags');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const [upvotes, setUpvotes] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [downvotes, setDownvotes] = useState({});
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setFetching(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching forum posts:', error);
    else setPosts(data || []);
    setFetching(false);
  }

  const handleUpvote = (postId, e) => {
    e.stopPropagation();
    setUpvotes(prev => ({ ...prev, [postId]: !prev[postId] }));
    setDownvotes(prev => ({ ...prev, [postId]: false }));
  };

  const handleDownvote = (postId, e) => {
    e.stopPropagation();
    setDownvotes(prev => ({ ...prev, [postId]: !prev[postId] }));
    setUpvotes(prev => ({ ...prev, [postId]: false }));
  };

  const handleBookmark = (postId, e) => {
    e.stopPropagation();
    setBookmarks(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (postId, e) => {
    e.stopPropagation();
    // In a real app this would copy link or open share dialog
    alert("Share link copied!");
  };

  const tabs = ['Hot', 'New', 'Solved', 'Unsolved', 'Pinned'];

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'Solved' && !post.is_resolved) return false;
    if (activeTab === 'Unsolved' && post.is_resolved) return false;
    if (activeTab === 'Pinned' && !post.is_pinned) return false;
    
    // For subject and tag, assuming basic filtering based on title/tags
    if (selectedSubject !== 'All Subjects') {
      // Mock subject match
      if (!(post.title?.toLowerCase().includes(selectedSubject.toLowerCase()))) {
        return false;
      }
    }

    if (selectedTag !== 'Filter by Tags') {
      const tagsArray = Array.isArray(post.tags) ? post.tags : [];
      if (!tagsArray.some(t => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === 'Hot') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    }
    return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
  });

  const totalPages = Math.ceil(sortedPosts.length / postsPerPage) || 1;
  const currentPosts = sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const getAvailableTags = () => {
    const allTags = new Set();
    posts.forEach(post => {
      const tagsArray = Array.isArray(post.tags) ? post.tags : [];
      tagsArray.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle/0 pt-2">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: '30px' }}>
            Discussion Forum 💬
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Ask questions, share knowledge, and collaborate with your peers.
          </p>
        </div>
        <button 
          onClick={() => setIsAskModalOpen(true)} 
          style={{ color: '#ffffff' }}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-surface-tint transition-colors shadow-sm shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Ask Question
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={MessageSquare} 
          title="Total Questions" 
          value="1,284" 
          iconBg="bg-primary/10 text-primary" 
        />
        <StatCard 
          icon={CheckCircle} 
          title="Solved" 
          value="892" 
          iconBg="bg-[#10b981]/10 text-[#10b981]" 
        />
        <StatCard 
          icon={BookOpen} 
          title="Total Answers" 
          value="4,501" 
          iconBg="bg-accent-purple/10 text-accent-purple" 
        />
        <StatCard 
          icon={Users} 
          title="Active Today" 
          value="342" 
          iconBg="bg-surface-container text-primary" 
        />
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-surface-white border border-border-subtle p-3 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={cn(
                "font-label-sm text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5",
                activeTab === tab 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "hover:bg-surface-container-low text-on-surface-variant"
              )}
            >
              {tab === 'Pinned' && <Pin className="w-4 h-4" />}
              {tab === 'Hot' && <Flame className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto shrink-0 shadow-sm rounded-lg">
            <select 
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-white border border-border-subtle text-on-surface font-body-sm text-sm rounded-lg pl-4 pr-10 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full cursor-pointer"
            >
              <option>All Subjects</option>
              <option>Computer Science</option>
              <option>Mathematics</option>
              <option>Physics</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
          </div>
          <div className="relative w-full sm:w-auto shrink-0 shadow-sm rounded-lg">
            <select 
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-white border border-border-subtle text-on-surface font-body-sm text-sm rounded-lg pl-4 pr-10 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full cursor-pointer"
            >
              <option>Filter by Tags</option>
              {getAvailableTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Forum Posts List */}
      <div className="space-y-4">
        {fetching ? (
          <div className="text-center text-zinc-500 py-8">Loading posts...</div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">No posts found.</div>
        ) : currentPosts.map((post, i) => {
          const tagsArray = Array.isArray(post.tags) ? post.tags : [];
          return (
            <PostCard 
              key={post.id || i}
              votes={(post.upvotes || 0) + (upvotes[post.id] ? 1 : downvotes[post.id] ? -1 : 0)}
              answers={post.replies_count || 0}
              views={post.views || 0}
              isPinned={post.is_pinned}
              isSolved={post.is_resolved}
              subject={selectedSubject !== 'All Subjects' ? selectedSubject : "General"}
              title={post.title}
              preview={post.content}
              tags={tagsArray}
              authorImg={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles?.name || 'User'}`}
              authorName={post.profiles?.name || "Student"}
              time={new Date(post.created_at).toLocaleDateString()}
              hasUpvoted={upvotes[post.id] || false}
              hasDownvoted={downvotes[post.id] || false}
              hasBookmarked={bookmarks[post.id] || false}
              onUpvote={(e) => handleUpvote(post.id, e)}
              onDownvote={(e) => handleDownvote(post.id, e)}
              onBookmark={(e) => handleBookmark(post.id, e)}
              onShare={(e) => handleShare(post.id, e)}
              onOpen={() => setSelectedPost(post)}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {sortedPosts.length > 0 && (
        <div className="flex justify-center mt-8 pt-6">
          <div className="flex items-center gap-1.5 shadow-sm rounded-lg max-w-full overflow-x-auto p-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border-subtle rounded-md text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 transition-colors bg-surface-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "min-w-[40px] h-10 px-2 border rounded-md font-label-md text-sm transition-colors",
                  currentPage === page 
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border-subtle text-on-surface hover:bg-surface-container-low bg-surface-white"
                )}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-border-subtle rounded-md text-on-surface hover:bg-surface-container-low disabled:opacity-50 transition-colors bg-surface-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAskModalOpen(false)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle bg-surface-container-lowest">
              <h2 className="font-headline-md text-xl font-bold text-on-surface">Ask a Question</h2>
              <p className="font-body-sm text-sm text-on-surface-variant mt-1">Get help from your peers and instructors.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1.5">Question Title</label>
                <input className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="What's your question?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-sm text-on-surface mb-1.5">Subject</label>
                  <select className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none">
                    <option>Select Subject...</option>
                    <option>Computer Science</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-sm text-on-surface mb-1.5">Tags</label>
                  <input className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. React, Python" />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1.5">Description</label>
                <textarea className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] resize-y" placeholder="Describe your problem in detail..."></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex justify-end gap-3">
              <button 
                onClick={() => setIsAskModalOpen(false)} 
                className="px-6 py-2.5 bg-surface-container-low border border-border-subtle hover:bg-surface-container text-on-surface font-label-md text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Question posted successfully!');
                  setIsAskModalOpen(false);
                }} 
                className="px-6 py-2.5 bg-primary text-white hover:brightness-110 font-label-md text-sm rounded-lg transition-all"
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
          <div className="bg-surface-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-subtle bg-surface-container-lowest flex justify-between items-start">
              <div>
                <span className="bg-surface-container-low border border-border-subtle text-on-surface px-2 py-0.5 rounded font-label-sm text-xs mb-2 inline-block">
                  {selectedSubject !== 'All Subjects' ? selectedSubject : "General"}
                </span>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">{selectedPost.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <img alt="Author" className="w-6 h-6 rounded-full object-cover shadow-sm bg-surface-container" src={selectedPost.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${selectedPost.profiles?.name || 'User'}`} />
                  <span className="font-label-sm text-sm text-on-surface font-semibold">{selectedPost.profiles?.name || "Student"}</span>
                  <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="w-1 h-1 bg-border-subtle rounded-full"></span>
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto font-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
              {selectedPost.content}
            </div>

            <div className="p-6 border-t border-border-subtle bg-surface-container-lowest flex gap-3">
              <input className="flex-1 bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-body-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Write a reply..." />
              <button 
                onClick={() => {
                  alert('Reply posted successfully!');
                  setSelectedPost(null);
                }} 
                className="px-6 py-2 bg-primary text-white hover:brightness-110 font-label-md text-sm rounded-lg transition-all"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, iconBg }) {
  return (
    <div className="bg-surface-white border border-border-subtle p-4 rounded-xl flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", iconBg)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">{title}</p>
        <p className="font-headline-lg text-2xl text-on-surface font-bold">{value}</p>
      </div>
    </div>
  );
}

function PostCard({
  votes, answers, views,
  isPinned, isSolved, isHot,
  subject, title, preview, tags,
  authorImg, authorName, time,
  hasUpvoted, onUpvote,
  hasDownvoted, onDownvote,
  hasBookmarked, onBookmark,
  onShare, onOpen
}) {
  return (
    <div onClick={onOpen} className="bg-surface-white border border-border-subtle rounded-xl p-5 flex flex-col sm:flex-row gap-6 hover:border-outline-variant transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] relative cursor-pointer">
      {/* Left: Voting & Stats */}
      <div className="flex sm:flex-col items-center sm:items-center justify-start gap-4 sm:w-16 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex flex-row sm:flex-col items-center gap-1 bg-surface-container-low sm:bg-transparent rounded-lg sm:rounded-none p-1.5 sm:p-0">
          <button onClick={onUpvote} className={cn("transition-colors rounded hover:bg-surface-container p-1", hasUpvoted ? "text-primary" : "text-outline hover:text-primary")}>
            <ChevronUp className="w-6 h-6" strokeWidth={hasUpvoted ? 3 : 2} />
          </button>
          <span className={cn("font-headline-sm text-lg font-bold leading-none p-1", hasUpvoted ? "text-primary" : hasDownvoted ? "text-error" : "text-on-surface")}>{votes}</span>
          <button onClick={onDownvote} className={cn("transition-colors rounded hover:bg-surface-container p-1", hasDownvoted ? "text-error" : "text-outline hover:text-error")}>
            <ChevronDown className="w-6 h-6" strokeWidth={hasDownvoted ? 3 : 2} />
          </button>
        </div>
        
        <div className={cn("flex flex-col items-center justify-center rounded-md p-1.5 min-w-[56px] border", 
          isSolved ? "bg-[#ecfdf5] border-[#ecfdf5]" : "border-border-subtle bg-surface-white"
        )}>
          <span className={cn("font-label-md text-sm font-bold leading-tight", isSolved ? "text-[#047857]" : "text-on-surface-variant")}>{answers}</span>
          <span className={cn("font-label-sm text-[10px] uppercase", isSolved ? "text-[#047857]" : "text-text-muted")}>answers</span>
        </div>
        
        <div className="hidden sm:flex flex-col items-center text-on-surface-variant">
          <span className="font-label-sm text-xs">{views}</span>
          <span className="font-label-sm text-[10px] uppercase text-text-muted">views</span>
        </div>
      </div>

      {/* Center: Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isPinned && (
            <span className="bg-accent-purple/10 text-accent-purple px-2 py-0.5 rounded-full font-label-sm text-xs flex items-center gap-1 border border-accent-purple/20">
              <Pin className="w-3.5 h-3.5" />
              Pinned
            </span>
          )}
          {isHot && (
            <span className="bg-error/10 text-error px-2 py-0.5 rounded-full font-label-sm text-xs flex items-center gap-1 border border-error/20">
              <Flame className="w-3.5 h-3.5" fill="currentColor" />
              Hot
            </span>
          )}
          {isSolved && (
            <span className="bg-[#ecfdf5] text-[#047857] px-2 py-0.5 rounded-full font-label-sm text-xs flex items-center gap-1 border border-[#a7f3d0]">
              <CheckCircle className="w-3.5 h-3.5" fill="currentColor" stroke="white" />
              Solved
            </span>
          )}
          <span className="bg-surface-container-low border border-border-subtle text-on-surface px-2 py-0.5 rounded font-label-sm text-xs">
            {subject}
          </span>
        </div>
        
        <h3 className="font-headline-md text-xl font-bold text-on-surface group-hover:text-primary mb-2 line-clamp-2 transition-colors">
          {title}
        </h3>
        
        <p className="font-body-sm text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
          {preview}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <span key={tag} className="bg-surface-container-low border border-border-subtle text-on-surface-variant px-2.5 py-1 rounded-md font-body-sm text-xs hover:bg-surface-container transition-colors cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-border-subtle w-full">
          <img alt="Author" className="w-6 h-6 rounded-full object-cover shadow-sm bg-surface-container" src={authorImg} />
          <span className="font-label-sm text-sm text-on-surface font-semibold">{authorName}</span>
          <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-2">
            <span className="w-1 h-1 bg-border-subtle rounded-full"></span>
            {time}
          </span>
          
          <div className="ml-auto flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={onShare} className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={onBookmark} className={cn("p-1.5 rounded-md transition-colors", hasBookmarked ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-primary hover:bg-primary/10")} title={hasBookmarked ? "Remove Bookmark" : "Bookmark"}>
              <Bookmark className="w-4 h-4" fill={hasBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
