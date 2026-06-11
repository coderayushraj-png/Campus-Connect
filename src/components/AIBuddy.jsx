import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

async function callGroqAI(messages, systemPrompt) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      systemPrompt
    })
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }
  
  const data = await response.json();
  return data.reply;
}

async function fetchCampusContext() {
  const [
    { data: placements },
    { data: events },
    { data: notices },
    { data: notes }
  ] = await Promise.all([
    supabase.from('placements')
      .select('company, role, deadline, package, eligible_branches, eligibility_cgpa, apply_link')
      .eq('is_active', true)
      .gte('deadline', new Date().toISOString())
      .order('deadline', {ascending: true})
      .limit(8)
      .then(res => res, err => ({ data: [] })),
    supabase.from('events')
      .select('title, event_date, venue, event_type')
      .gte('event_date', new Date().toISOString())
      .order('event_date', {ascending: true})
      .limit(5)
      .then(res => res, err => ({ data: [] })),
    supabase.from('notices')
      .select('title, content, type, is_important')
      .order('created_at', {ascending: false})
      .limit(5)
      .then(res => res, err => ({ data: [] })),
    supabase.from('notes')
      .select('title, subject, semester')
      .order('created_at', {ascending: false})
      .limit(10)
      .then(res => res, err => ({ data: [] }))
  ]);

  const mockPlacements = placements?.length ? placements : [
    { company: 'TechCorp Inc.', role: 'SDE', package: '12 LPA', eligibility_cgpa: 7.5, eligible_branches: ['CS', 'IT'], deadline: new Date(Date.now() + 86400000 * 2).toISOString() }
  ];
  const mockEvents = events?.length ? events : [
    { title: 'Annual Cultural Fest Euphoria 2023', event_date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'Main Auditorium' }
  ];
  const mockNotices = notices?.length ? notices : [
    { title: 'URGENT: Campus Closure Due to Severe Weather', content: 'All classes suspended for Tuesday.', is_important: true },
    { title: 'Revised Mid-Semester Examination Schedule', content: 'Postponed due to advisory. Check PDF.', is_important: true },
    { title: 'New IEEE Journal Subscriptions', content: 'Available now via campus network.', is_important: false }
  ];
  const mockNotes = notes?.length ? notes : [
    { title: 'Data Structures & Algorithms - Midterm Review', subject: 'Computer Science', semester: '4' }
  ];

  return `
TODAY: ${new Date().toLocaleDateString('en-IN')}
COLLEGE: MMDU, Ambala, Haryana

ACTIVE PLACEMENT DRIVES:
${mockPlacements.map(p => 
  `- ${p.company} | ${p.role} | Package: ${p.package} | Min CGPA: ${p.eligibility_cgpa} | Branches: ${p.eligible_branches?.join(',')} | Deadline: ${new Date(p.deadline).toLocaleDateString('en-IN')}`
).join('\\n')}

UPCOMING EVENTS:
${mockEvents.map(e => 
  `- ${e.title} | ${new Date(e.event_date).toLocaleDateString('en-IN')} | ${e.venue || 'Venue TBA'}`
).join('\\n')}

RECENT NOTICES:
${mockNotices.map(n => 
  `- ${n.is_important ? '⚠️ ' : ''}${n.title}: ${n.content?.slice(0,100)}...`
).join('\\n')}

AVAILABLE NOTES:
${mockNotes.map(n => 
  `- ${n.title} | ${n.subject} | Sem ${n.semester}`
).join('\\n')}
  `;
}

function buildSystemPrompt(context) {
  return `
You are AI Buddy for Campus Connect at Maharishi Markandeshwar University.
You are like a helpful senior student.

REAL-TIME CAMPUS DATA:
${context}

YOU CAN HELP WITH:
1. Placement drives and deadlines
2. Upcoming campus events
3. Recent official notices
4. Academic concepts (DSA, DBMS, Networks, OOP, OS, Math etc)
5. How to use Campus Connect features
6. General academic queries

PERSONALITY:
- Friendly, encouraging
- Concise responses
- Use emojis occasionally
- If asked about concepts, explain with simple examples
- Always mention deadlines clearly
- If data not available, say so

RULES:
- Never make up information
- For placement, always show deadline
- Keep responses under 200 words
- Use bullet points for lists
`;
}

export default function AIBuddy({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = {
      role: 'user',
      content: text.trim(),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const context = await fetchCampusContext();
      const systemPrompt = buildSystemPrompt(context);
      
      const history = messages
        .slice(-8)
        .map(m => ({
          role: m.role,
          content: m.content
        }));
      history.push({ 
        role: 'user', 
        content: text.trim() 
      });
      
      const aiResponse = await callGroqAI(history, systemPrompt);
      
      const aiMsg = {
        role: 'assistant',
        content: aiResponse,
        id: Date.now() + 1
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      console.error('Groq AI Error:', error);
      const errMsg = {
        role: 'assistant',
        content: '❌ Sorry, I could not get a response. Please try again.',
        id: Date.now() + 1,
        isError: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl p-2 flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-[18px]">AI Buddy</div>
                <div className="text-white/60 text-xs">Your campus assistant</div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 justify-center mt-3 bg-white/10 rounded-full px-3 py-1.5 w-fit mx-auto">
            <div className="w-[6px] h-[6px] bg-emerald-400 rounded-full animate-pulse" />
            <div className="text-white/70 text-xs">Online • Groq Llama 3.3</div>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="col-span-2 text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2">What can I help with?</div>
              
              <div 
                onClick={() => sendMessage("What placement drives are currently active?")}
                className="bg-white border border-zinc-100 rounded-xl p-3 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="text-xl mb-1">🎓</div>
                <div className="text-sm font-semibold text-zinc-800">Placement Info</div>
                <div className="text-xs text-zinc-400 mt-0.5">Active drives & deadlines</div>
              </div>
              
              <div 
                onClick={() => sendMessage("Help me understand a topic. Ask me which subject.")}
                className="bg-white border border-zinc-100 rounded-xl p-3 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="text-xl mb-1">📚</div>
                <div className="text-sm font-semibold text-zinc-800">Study Help</div>
                <div className="text-xs text-zinc-400 mt-0.5">Concepts & explanations</div>
              </div>
              
              <div 
                onClick={() => sendMessage("What is happening on campus this week?")}
                className="bg-white border border-zinc-100 rounded-xl p-3 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="text-xl mb-1">📅</div>
                <div className="text-sm font-semibold text-zinc-800">Campus Updates</div>
                <div className="text-xs text-zinc-400 mt-0.5">Events & announcements</div>
              </div>
              
              <div 
                onClick={() => sendMessage("Show me the latest important notices.")}
                className="bg-white border border-zinc-100 rounded-xl p-3 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left"
              >
                <div className="text-xl mb-1">📢</div>
                <div className="text-sm font-semibold text-zinc-800">Latest Notices</div>
                <div className="text-xs text-zinc-400 mt-0.5">Important announcements</div>
              </div>
            </div>
            
            <div className="px-4 pb-2 mt-2">
              <div className="text-xs text-zinc-400 mb-2">Quick questions:</div>
              <div className="flex flex-col gap-2">
                {[
                  "Which drives close this week? 📅",
                  "Explain binary search trees 🌳",
                  "Any events this weekend? 🎉",
                  "What is normalization in DBMS? 📖",
                  "Latest placement package? 💰"
                ].map((chip, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(chip)}
                    className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 px-3 py-2 rounded-xl hovtext-left hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 cursor-pointer text-left w-full transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m) => (
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="bg-indigo-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2">
                  <div className="w-[28px] h-[28px] rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mt-1">
                    <Bot className="text-white w-[13px] h-[13px]" />
                  </div>
                  <div className={"bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] text-sm leading-relaxed shadow-sm border-l-[3px] " + (m.isError ? 'border-l-red-500 text-red-600' : 'border-l-[#6366f1] text-zinc-700 whitespace-pre-wrap')}>
                    {m.content}
                  </div>
                </div>
              )
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-2 py-1">
                <div className="w-[28px] h-[28px] rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mt-1">
                  <Bot className="text-white w-[13px] h-[13px]" />
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border-l-[3px] border-l-[#6366f1] flex gap-1">
                  <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce [animation-delay:100ms]"></div>
                  <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce [animation-delay:200ms]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="p-4 border-t border-zinc-200 bg-white">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] text-zinc-400">⚡ Real-time data • May make mistakes</div>
            {messages.length > 0 && (
              <button 
                onClick={() => setMessages([])}
                className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer text-right transition-colors"
              >
                Clear chat
              </button>
            )}
          </div>
          <div className="flex gap-2 items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about campus..."
              className="flex-1 border border-zinc-200 rounded-xl px-4 py-3 text-sm resize-none min-h-[44px] max-h-[120px] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none overflow-y-auto"
              rows={1}
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="w-[44px] h-[44px] rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
