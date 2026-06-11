import 'dotenv/config';
import express from 'express';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeRAG, retrieveRelevantContext } from './server/rag.js';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Send Notice Emails
  app.post("/api/send-notice-emails", async (req, res) => {
    try {
      if (!resend) {
        throw new Error("RESEND_API_KEY is not configured.");
      }

      const { title, desc } = req.body;

      const { data: students } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'student')
        .eq('is_active', true);

      let emailsSent = 0;

      const sendEmail = async (studentEmail: string, studentName: string) => {
        const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:40px auto;">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px;text-align:center;border-radius:16px 16px 0 0;">
            <div style="font-size:36px;">📢</div>
            <h1 style="color:white;margin:0;">Campus Connect</h1>
            <p style="color:#ffffffb3;margin:0;">New Official Notice</p>
          </div>
          <div style="background:white;padding:28px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 16px 16px;">
            <p>Hi ${studentName} 👋</p>
            <p>A new notice has been published by the administration.</p>
            <div style="background:#fafafa;border-left:4px solid #6366f1;padding:16px;margin-bottom:24px;">
              <p style="font-size:17px;font-weight:700;margin:0 0 10px 0;">${title}</p>
              <p style="color:#3f3f46;font-size:14px;margin:0;white-space:pre-wrap;">${desc}</p>
            </div>
            <p style="text-align:center;"><a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" style="background:#6366f1;color:white;padding:12px 28px;text-decoration:none;border-radius:10px;font-weight:bold;">View on Campus Connect →</a></p>
          </div>
        </div>`;

        await resend!.emails.send({
          from: 'Campus Connect <onboarding@resend.dev>',
          to: studentEmail,
          subject: '📢 New Notice: ' + title,
          html
        });
      };

      for (const student of (students || [])) {
        await sendEmail(student.email, student.name);
        await supabase.from('notifications').insert({ 
          user_id: student.id, 
          title: '📢 ' + title, 
          message: desc, 
          type: 'notice' 
        });
        emailsSent++;
      }

      res.json({ success: true, emailsSent });
    } catch (error: any) {
      console.error('Send Notice Emails Error:', error);
      res.status(500).json({ error: error.message || "Failed to send emails" });
    }
  });

  // Trigger Deadlines API for testing emails
  app.post("/api/trigger-deadlines", async (req, res) => {
    try {
      if (!resend) {
        throw new Error("RESEND_API_KEY is not configured.");
      }

      const now = new Date();
      // Tomorrow range
      const tomorrowStart = new Date(now);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // 7 days range
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() + 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setHours(23, 59, 59, 999);

      // Get 1-day deadlines
      const { data: oneDayDeadlines } = await supabase
        .from('deadlines')
        .select('*')
        .gte('date', tomorrowStart.toISOString())
        .lte('date', tomorrowEnd.toISOString())
        .eq('notified_1day', false)
        .eq('is_active', true);

      // Get 7-day deadlines
      const { data: weekDeadlines } = await supabase
        .from('deadlines')
        .select('*')
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString())
        .eq('notified_1week', false)
        .eq('is_active', true);

      const { data: students } = await supabase
        .from('profiles')
        .select('id, name, email, branch')
        .eq('role', 'student')
        .eq('is_active', true);

      let emailsSent = 0;

      const sendEmail = async (studentEmail: string, studentName: string, deadlineTitle: string, deadlineDate: string, deadlineType: string, daysLeft: number) => {
        const urgencyColor = daysLeft <= 1 ? '#ef4444' : '#f59e0b';
        const typeEmoji = ({ placement: '🎓', event: '📅', exam: '📝', notice: '📢', general: '🔔' } as any)[deadlineType] || '🔔';
        const formattedDate = new Date(deadlineDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:40px auto;">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px;text-align:center;border-radius:16px 16px 0 0;">
            <div style="font-size:36px;">${typeEmoji}</div>
            <h1 style="color:white;margin:0;">Campus Connect</h1>
            <p style="color:#ffffffb3;margin:0;">Deadline Reminder</p>
          </div>
          <div style="background:white;padding:28px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 16px 16px;">
            <p>Hi ${studentName} 👋</p>
            <p>You have an upcoming deadline that needs your attention.</p>
            <div style="background:#fafafa;border-left:4px solid ${urgencyColor};padding:16px;margin-bottom:24px;">
              <p style="color:#71717a;font-size:11px;font-weight:600;margin:0;">${deadlineType?.toUpperCase()} DEADLINE</p>
              <p style="font-size:17px;font-weight:700;margin:6px 0;">${deadlineTitle}</p>
              <span style="background:${urgencyColor}20;color:${urgencyColor};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;">
                ${daysLeft === 0 ? '🔥 Due Today!' : daysLeft === 1 ? '⚠️ Due Tomorrow!' : '📅 ' + daysLeft + ' Days Left'}
              </span>
              <p style="color:#71717a;font-size:13px;margin:10px 0 0;">📅 ${formattedDate}</p>
            </div>
            <p style="text-align:center;"><a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" style="background:#6366f1;color:white;padding:12px 28px;text-decoration:none;border-radius:10px;font-weight:bold;">View on Campus Connect →</a></p>
          </div>
        </div>`;

        await resend!.emails.send({
          from: 'Campus Connect <onboarding@resend.dev>',
          to: studentEmail,
          subject: daysLeft <= 1 ? '⚠️ Deadline Tomorrow: ' + deadlineTitle : '📅 Reminder: ' + deadlineTitle + ' - ' + daysLeft + ' Days Left',
          html
        });
      };

      for (const deadline of (oneDayDeadlines || [])) {
        const eligible = students?.filter(s => !deadline.target_branches?.length || deadline.target_branches.includes(s.branch)) || [];
        for (const student of eligible) {
          await sendEmail(student.email, student.name, deadline.title, deadline.date, deadline.type, 1);
          await supabase.from('notifications').insert({ user_id: student.id, title: '⚠️ Deadline Tomorrow!', message: deadline.title + ' is due tomorrow!', type: deadline.type || 'deadline', related_id: deadline.related_id });
          emailsSent++;
        }
        await supabase.from('deadlines').update({ notified_1day: true }).eq('id', deadline.id);
      }

      for (const deadline of (weekDeadlines || [])) {
        const eligible = students?.filter(s => !deadline.target_branches?.length || deadline.target_branches.includes(s.branch)) || [];
        for (const student of eligible) {
          await sendEmail(student.email, student.name, deadline.title, deadline.date, deadline.type, 7);
          await supabase.from('notifications').insert({ user_id: student.id, title: '📅 Upcoming Deadline', message: deadline.title + ' is due in 7 days.', type: deadline.type || 'deadline', related_id: deadline.related_id });
          emailsSent++;
        }
        await supabase.from('deadlines').update({ notified_1week: true }).eq('id', deadline.id);
      }

      res.json({ success: true, emailsSent, oneDayDeadlines: oneDayDeadlines?.length || 0, weekDeadlines: weekDeadlines?.length || 0 });
    } catch (error: any) {
      console.error('Trigger Deadlines Error:', error);
      res.status(500).json({ error: error.message || "Failed to trigger deadlines" });
    }
  });

  // API constraints check
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return ai;
  }

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const client = getGeminiClient();

      // Ensure history format maps to contents array
      const contents = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Add the new user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Retrieve relevant context chunks using RAG
      const retrievedChunks = await retrieveRelevantContext(message, 3);
      const retrievedContext = retrievedChunks.map(chunk => `[${(chunk as any).metadata?.category || (chunk as any).category || 'General'}] ${chunk.text}`).join('\n\n');

      const systemInstruction = `You are Campus Connect AI Buddy, an intelligent and friendly assistant for students.
Your responsibilities are:

Answer campus-specific questions using the retrieved Campus Connect context.
Answer general educational, technical, and career-related questions using your own knowledge.
Maintain conversation context so you can answer follow-up questions naturally.

Instructions:

If the user's question relates to campus notices, placements, internships, clubs, events, lost and found, forum discussions, or FAQs, prioritize the retrieved Campus Connect context.
If relevant campus context is available, treat it as the primary and authoritative source of truth.
If the user asks about campus information and the required information is not present in the retrieved context, respond exactly:
"I couldn't find that information in the current campus data."
Do not invent or assume campus-specific facts that are not present in the retrieved context.
If the user's question is unrelated to Campus Connect (for example: "What is DSA?", "Explain React", "What is Operating System?"), answer normally using your general knowledge.
For general educational questions, provide clear, accurate, and student-friendly explanations.
For coding-related questions, include examples when helpful.
Use concise answers for simple questions and detailed explanations when the topic requires it.
Format longer responses using bullet points or sections for readability.

Retrieved Campus Context:
${retrievedContext}`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: systemInstruction
        }
      });

      res.json({ reply: response.text, sources: retrievedChunks });
    } catch (error: any) {
      console.error('Chat API Error:', error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { messages, systemPrompt, format } = req.body;
      const client = getGeminiClient();

      const contents = (messages || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const config: any = {};
      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }
      if (format === 'json') {
        config.responseMimeType = "application/json";
      }

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Generate API Error:', error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Initialize RAG before starting the server
  try {
    await initializeRAG();
  } catch (error) {
    console.error("Failed to initialize RAG system:", error);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
