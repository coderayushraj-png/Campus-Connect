import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Upload, Download, Sparkles, ScrollText, CheckCircle, Copy, CheckSquare, Layers, X, Loader2, ArrowLeft, ArrowRight, RotateCw, Shuffle, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';

async function callGroqAI(messages, systemPrompt, format = 'text') {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      systemPrompt,
      format
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }
  
  const data = await response.json();
  return data.reply;
}

export default function Notes() {
  const [studyModalData, setStudyModalData] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedFileType, setSelectedFileType] = useState('All');

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        profiles (id, name, avatar_url)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  }

  const filteredNotes = notes.filter(note => {
    if (searchQuery && !note.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (selectedSemester !== 'All Semesters') {
      if (`Semester ${note.semester}` !== selectedSemester) return false;
    }
    
    if (selectedSubject !== 'All Subjects') {
      if (note.subject !== selectedSubject) return false;
    }

    if (selectedFileType !== 'All') {
      const typeStr = (note.file_type || '').toLowerCase();
      if (selectedFileType === 'PDF' && !typeStr.includes('pdf')) return false;
      if (selectedFileType === 'DOC' && !typeStr.includes('doc')) return false;
      if (selectedFileType === 'PPT' && !typeStr.includes('ppt')) return false;
    }

    return true;
  });

  // Pre-assigned colors for notes
  const colors = [
    { top: "bg-[#ef4444]", icon: "bg-red-50 text-[#ef4444] border-red-100", bg: "bg-primary-container text-on-primary-container" },
    { top: "bg-[#f97316]", icon: "bg-orange-50 text-[#f97316] border-orange-100", bg: "bg-emerald-200 text-emerald-800" },
    { top: "bg-[#3b82f6]", icon: "bg-blue-50 text-[#3b82f6] border-blue-100", bg: "bg-secondary-container text-on-secondary-container" },
    { top: "bg-[#8b5cf6]", icon: "bg-purple-50 text-[#8b5cf6] border-purple-100", bg: "bg-surface-variant text-on-surface-variant" }
  ];

  return (
    <div className="max-w-[1152px] mx-auto w-full space-y-stack-lg pb-12">
      {/* Section 1: Header */}
      <div className="flex justify-between items-end border-b border-border-subtle/0 pt-2">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3 font-bold text-[30px]">
            Notes Library <span className="text-3xl">📚</span>
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{notes.length} notes available across all your subjects.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          style={{ color: '#ffffff' }}
          className="bg-gradient-to-r from-primary to-accent-purple text-on-[color:var(--on-primary)] font-label-md text-label-md px-4 py-2 rounded-lg hover:shadow-md transition-all flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Notes
        </button>
      </div>

      {/* Section 2: Filter Bar */}
      <div className="bg-surface-white rounded-xl border border-border-subtle p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] flex flex-wrap lg:flex-nowrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full lg:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg text-body-sm font-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
              placeholder="Search notes, topics..." 
              type="text" 
            />
          </div>
          <div className="relative">
            <select 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border border-border-subtle rounded-lg py-2 pl-4 pr-8 text-body-sm font-body-sm bg-surface-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
              <option>All Semesters</option>
              <option>Semester 1</option>
              <option>Semester 2</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-border-subtle rounded-lg py-2 pl-4 pr-8 text-body-sm font-body-sm bg-surface-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
              <option>All Subjects</option>
              <option>Computer Science</option>
              <option>Mathematics</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          </div>
        </div>
        
        <div className="flex items-center gap-6 shrink-0 lg:border-l border-border-subtle lg:pl-6">
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-border-subtle">
            <button 
              onClick={() => setSelectedFileType('All')}
              className={cn("px-3 py-1 rounded-md text-label-sm font-label-sm transition-colors", selectedFileType === 'All' ? "bg-surface-white shadow-sm text-primary font-bold" : "text-on-surface-variant hover:text-on-surface")}>All</button>
            <button 
              onClick={() => setSelectedFileType('PDF')}
              className={cn("px-3 py-1 rounded-md text-label-sm font-label-sm transition-colors", selectedFileType === 'PDF' ? "bg-surface-white shadow-sm text-primary font-bold" : "text-on-surface-variant hover:text-on-surface")}>PDF</button>
            <button 
              onClick={() => setSelectedFileType('DOC')}
              className={cn("px-3 py-1 rounded-md text-label-sm font-label-sm transition-colors", selectedFileType === 'DOC' ? "bg-surface-white shadow-sm text-primary font-bold" : "text-on-surface-variant hover:text-on-surface")}>DOC</button>
            <button 
              onClick={() => setSelectedFileType('PPT')}
              className={cn("px-3 py-1 rounded-md text-label-sm font-label-sm transition-colors", selectedFileType === 'PPT' ? "bg-surface-white shadow-sm text-primary font-bold" : "text-on-surface-variant hover:text-on-surface")}>PPT</button>
          </div>
          <span className="text-body-sm font-body-sm text-on-surface-variant whitespace-nowrap hidden xl:inline-block">Showing <strong>{filteredNotes.length}</strong> results</span>
        </div>
      </div>

      {/* Section 3: Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full py-8 text-center text-zinc-500 font-medium">No notes match your filter.</div>
          ) : filteredNotes.map((note, idx) => {
            const colorTheme = colors[idx % colors.length];
            // Format file size
            const sizeMB = note.file_size ? (note.file_size / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown Size';
            
            return (
              <NoteCard 
                key={note.id || idx}
                topColor={colorTheme.top}
                iconColor={colorTheme.icon}
                title={note.title}
                tag1={note.subject}
                tag2={`Sem ${note.semester || 'N/A'}`}
                authorInit={note.profiles?.name ? note.profiles.name.substring(0, 2).toUpperCase() : "AD"}
                authorName={note.profiles?.name || "Admin"}
                authorBg={colorTheme.bg}
                size={sizeMB}
                onStudyClick={(tab) => setStudyModalData({ note: { ...note, ...colorTheme, tag1: note.subject }, initialTab: tab })}
              />
            );
          })}
        </div>
      )}

      {/* Study Modal */}
      {studyModalData && (
        <StudyModal 
          note={studyModalData.note} 
          initialTab={studyModalData.initialTab}
          onClose={() => setStudyModalData(null)} 
        />
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} />
      )}
    </div>
  );
}

function UploadModal({ onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full bg-white rounded-2xl shadow-2xl z-50 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Upload Notes</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
            <input type="text" className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Operating Systems Chapter 1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Subject</label>
              <select className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none">
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Semester</label>
              <select className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none">
                <option>Sem 1</option>
                <option>Sem 2</option>
                <option>Sem 3</option>
                <option>Sem 4</option>
                <option>Sem 5</option>
                <option>Sem 6</option>
                <option>Sem 7</option>
                <option>Sem 8</option>
              </select>
            </div>
          </div>

          <div 
            className={cn("border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors", dragActive ? "border-primary bg-primary/5" : "border-zinc-300 bg-zinc-50")}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center gap-3 text-emerald-600 font-medium">
                <CheckCircle className="w-6 h-6" />
                {file.name}
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-400 mb-3" />
                <div className="text-zinc-600 font-medium text-sm mb-1">Drag & drop your file here</div>
                <div className="text-zinc-400 text-xs text-center mb-4">Supported files: PDF, DOCX, PPTX (Max 10MB)</div>
                <label className="cursor-pointer bg-white px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                  Browse Files
                  <input type="file" className="hidden" onChange={handleChange} />
                </label>
              </>
            )}
          </div>

        </div>

        <div className="mt-8 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-zinc-600 font-medium hover:bg-zinc-100 transition-colors">Cancel</button>
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="flex items-center justify-center px-5 py-2 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium hover:bg-primary/90 transition-colors min-w-[100px]"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
          </button>
        </div>
      </div>
    </>
  );
}

function NoteCard({ topColor, iconColor, title, tag1, tag2, authorInit, authorName, authorBg, size, onStudyClick }) {
  return (
    <div className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05),_0_10px_15px_-3px_rgba(0,0,0,0.1)] flex flex-col group hover:-translate-y-1 transition-transform duration-200">
      <div className={cn("h-[6px] w-full", topColor)}></div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border", iconColor)}>
            <div className="w-6 h-6 bg-current opacity-80 rounded-[2px]" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\'/%3E%3Cpolyline points=\'14 2 14 8 20 8\'/%3E%3C/svg%3E")', maskSize: 'cover' }}></div>
          </div>
          <div>
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-surface-container rounded-full text-label-sm font-label-sm text-on-surface-variant border border-border-subtle">{tag1}</span>
          <span className="px-2 py-1 bg-surface-container rounded-full text-label-sm font-label-sm text-on-surface-variant border border-border-subtle">{tag2}</span>
        </div>

        {/* AI Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4 border-t border-border-subtle pt-3">
          <button 
            onClick={() => onStudyClick('summary')}
            className="flex flex-col items-center justify-center py-2 px-1 text-center rounded-lg text-primary hover:bg-primary/10 transition-colors gap-1 border border-transparent hover:border-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Summarize</span>
          </button>
          <button 
            onClick={() => onStudyClick('quiz')}
            className="flex flex-col items-center justify-center py-2 px-1 text-center rounded-lg text-amber-600 hover:bg-amber-50 transition-colors gap-1 border border-transparent hover:border-amber-200"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Quiz Me</span>
          </button>
          <button 
            onClick={() => onStudyClick('flashcards')}
            className="flex flex-col items-center justify-center py-2 px-1 text-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors gap-1 border border-transparent hover:border-emerald-200"
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Flashcards</span>
          </button>
        </div>
        
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", authorBg)}>
              {authorInit}
            </div>
            <span className="text-label-sm font-label-sm text-on-surface-variant">{authorName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-label-sm font-label-sm text-outline">{size}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); alert(`Downloading ${title}...`); }}
              className="text-primary hover:text-accent-purple transition-colors bg-primary/10 p-1.5 rounded-md">
              <Download className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudyModal({ note, initialTab, onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'summary');
  
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Study Assistant</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 leading-tight">{note.title}</h2>
            <div className="text-sm text-zinc-500 mt-1">{note.tag1}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-zinc-200 gap-6">
          <button 
            onClick={() => setActiveTab('summary')}
            className={cn("pb-3 pt-4 text-sm font-medium border-b-2 transition-colors", activeTab === 'summary' ? "border-primary text-primary" : "border-transparent text-zinc-500 hover:text-zinc-700")}
          >
            <div className="flex items-center gap-2"><ScrollText className="w-4 h-4" /> Summary</div>
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={cn("pb-3 pt-4 text-sm font-medium border-b-2 transition-colors", activeTab === 'quiz' ? "border-amber-500 text-amber-600" : "border-transparent text-zinc-500 hover:text-zinc-700")}
          >
            <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Quiz</div>
          </button>
          <button 
            onClick={() => setActiveTab('flashcards')}
            className={cn("pb-3 pt-4 text-sm font-medium border-b-2 transition-colors", activeTab === 'flashcards' ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700")}
          >
            <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> Flashcards</div>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50">
          {activeTab === 'summary' && <SummaryTab note={note} />}
          {activeTab === 'quiz' && <QuizTab note={note} />}
          {activeTab === 'flashcards' && <FlashcardsTab note={note} />}
        </div>
      </div>
    </>
  );
}

function SummaryTab({ note }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      setIsLoading(true);
      setError(null);
      const prompt = `
        Create a concise bullet-point summary for a college student studying:
        Subject: ${note.tag1}
        Topic: ${note.title}
        
        Format:
        📌 Key Concepts (5-7 points)
        💡 Important Formulas/Rules (if any)
        ⚡ Quick Revision Points (3-4 points)
      `;
      try {
        const response = await callGroqAI(
          [{ role: 'user', content: prompt }],
          'You are a helpful study assistant for college students. Format the output nicely in Markdown.'
        );
        setSummary(response);
      } catch (err) {
        console.error('Groq AI Error (Summary):', err);
        setError('Failed to generate summary. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [note]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <div className="text-sm font-medium">Reading notes and generating summary...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="relative">
      <button 
        onClick={() => navigator.clipboard.writeText(summary)}
        className="absolute top-0 right-0 p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-indigo-100 bg-white"
      >
        <Copy className="w-3.5 h-3.5" /> Copy
      </button>
      <div className="prose prose-sm prose-indigo max-w-none pt-2">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}

function QuizTab({ note }) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      setIsLoading(true);
      setError(null);
      const prompt = `
        Generate 5 MCQ questions for:
        Subject: ${note.tag1}
        Topic: ${note.title}
        
        Return ONLY this JSON, nothing else:
        [
          {
            "question": "...",
            "options": ["...", "...", "...", "..."],
            "correct": 0,
            "explanation": "..."
          }
        ]
      `;
      try {
        let responseText = await callGroqAI(
          [{ role: 'user', content: prompt }],
          'You are a helpful study assistant. Only output raw JSON, no markdown formatting or backticks.'
        );
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(responseText);
        setQuestions(data);
      } catch (err) {
        console.error('Groq AI Error (Quiz):', err);
        setError('Failed to generate quiz. AI might have returned invalid format.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuiz();
  }, [note]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-amber-600">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <div className="text-sm font-medium">Generating questions...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Quiz Complete! 🎉</h3>
        <p className="text-lg text-zinc-600 mb-8">You scored {score} out of {questions.length}</p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setShowResult(false);
            setSelectedOption(null);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  const handleOptionClick = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn("w-8 h-2 rounded-full", i === currentIndex ? "bg-amber-500" : i < currentIndex ? "bg-amber-200" : "bg-zinc-200")} />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-6">
        <h3 className="font-semibold text-lg text-zinc-900 mb-4">{q.question}</h3>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, idx) => {
            let stateClass = "bg-zinc-50 border-zinc-200 hover:border-amber-300 hover:bg-amber-50";
            if (selectedOption !== null) {
              if (idx === q.correct) stateClass = "bg-green-100 border-green-500 text-green-900";
              else if (idx === selectedOption) stateClass = "bg-red-100 border-red-500 text-red-900";
              else stateClass = "bg-zinc-50 border-zinc-200 opacity-50";
            }
            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleOptionClick(idx)}
                className={cn("text-left p-4 rounded-xl border transition-all duration-200 text-sm", stateClass)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
            <div className="font-semibold text-blue-900 text-sm mb-1">Explanation</div>
            <div className="text-blue-800 text-sm">{q.explanation}</div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleNext}
              className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardsTab({ note }) {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [note]);

  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    const prompt = `
      Generate 8 flashcards for:
      Subject: ${note.tag1}
      Topic: ${note.title}
      
      Return ONLY this JSON:
      [
        {"front": "Question/Term", "back": "Answer/Definition"}
      ]
    `;
    try {
      let responseText = await callGroqAI(
        [{ role: 'user', content: prompt }],
        'You are a helpful study assistant. Only output raw JSON, no formatting or markdown. It must be an array of objects.'
      );
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(responseText);
      setCards(data);
    } catch (err) {
      setError('Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <div className="text-sm font-medium">Extracting flashcards...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (cards.length === 0) return null;

  const card = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i + 1) % cards.length);
    }, 150);
  };
  
  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      <div className="text-sm font-semibold text-zinc-500 mb-6 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full text-emerald-700">
        Card {currentIndex + 1} / {cards.length}
      </div>

      <div 
        className="relative w-full aspect-[3/2] cursor-pointer" 
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-500 shadow-xl rounded-3xl"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 w-full h-full bg-white border-2 border-emerald-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-4xl font-bold text-zinc-900 tracking-tight leading-tight">{card.front}</div>
            <div className="absolute bottom-6 flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-medium">
              <RotateCw className="w-3.5 h-3.5" /> Click to flip
            </div>
          </div>
          
          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full bg-emerald-500 text-white rounded-3xl flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xl font-medium leading-relaxed">{card.back}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8 w-full justify-center">
        <button onClick={handlePrev} className="p-3 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 text-zinc-600 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={fetchCards} className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors" title="Shuffle & Regenerate">
          <Shuffle className="w-4 h-4" /> Shuffle All
        </button>
        <button onClick={handleNext} className="p-3 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 text-zinc-600 transition-colors shadow-sm">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
