import { GoogleGenAI } from '@google/genai';

export interface VectorDocument {
  id: string;
  category: string;
  text: string;
  embedding: number[];
}

export interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
}

let vectorStore: VectorDocument[] = [];
let ai: GoogleGenAI | null = null;
let isInitialized = false;

const KNOWLEDGE_BASE = [
  { id: "notice-1", category: "Notices", text: "URGENT Campus Closure: All classes and administrative operations are suspended for Tuesday, Nov 14th due to severe weather. Please stay indoors." },
  { id: "notice-2", category: "Notices", text: "Revised Mid-Semester Examination Schedule for Fall 2023: Due to the recent weather advisory, the mid-semester examinations originally scheduled for next week have been postponed. Affects all engineering and science departments." },
  { id: "notice-3", category: "Notices", text: "TechCorp Inc. Pre-Placement Talk & Registration Details: TechCorp will be visiting the campus for the 2024 graduation batch recruitment. The pre-placement talk is scheduled tomorrow at 10:00 AM in the main auditorium." },
  { id: "notice-4", category: "Notices", text: "Annual Cultural Fest 'Euphoria 2023' Core Team Selections: Applications are now open for core committee positions. Interviews commence next Monday." },
  { id: "notice-5", category: "Notices", text: "New IEEE Journal Subscriptions Available: The central library has expanded its digital resources. Students and faculty can now access over 50 new IEEE journals and conference proceedings." },
  { id: "placement-1", category: "Placement", text: "Google Software Engineer (Full Time, 32.0 LPA, closes in 2 days, Min 8.0 CGPA)" },
  { id: "placement-2", category: "Placement", text: "Microsoft Data Scientist Intern (Internship, 1.2 L/mo, closes in 5 days, Min 7.5 CGPA)" },
  { id: "placement-3", category: "Placement", text: "Amazon Cloud Architect (Full Time, 28.5 LPA, closes in 12 days, Min 8.5 CGPA)" },
  { id: "lost-1", category: "Lost & Found", text: "LOST: Silver MacBook Pro 14\" - Left it in the main library on the 2nd floor near the large windows. (by Alex J. 2 hours ago)" },
  { id: "lost-2", category: "Lost & Found", text: "LOST: Student ID Card for Sarah M. - Lost my student ID somewhere between the Engineering block and the cafeteria." },
  { id: "lost-3", category: "Lost & Found", text: "FOUND: Sony WH-1000XM4 Headphones - Found these black headphones sitting on a bench near the north entrance of the Science building." },
  { id: "forum-1", category: "Student Forum", text: "Forum (Hot/Pinned): Best practices for implementing authentication in React Native apps?" },
  { id: "forum-2", category: "Student Forum", text: "Forum (Unsolved/Hot): Understanding limits in multivariable calculus. What if all straight line paths yield the same result...?" },
  { id: "club-1", category: "Clubs", text: "Google Developer Student Club is a technical club with over 1,200 members." },
  { id: "club-2", category: "Clubs", text: "Thespians Society is a cultural club focused on drama and performance with 450 members." },
  { id: "club-3", category: "Clubs", text: "Chess Masters is a sports club for strategic thinking and competitive play with 210 members." },
  { id: "club-4", category: "Clubs", text: "RoboTech Hub is a technical club focused on building robots, AI and hardware design with 89 members." },
  { id: "club-5", category: "Clubs", text: "Campus Care is a social club dedicated to local community service and campus environmental sustainability projects." },
  { id: "club-6", category: "Clubs", text: "Fine Arts Guild is a creative club providing a space for painters, illustrators, and sculptors to collaborate." },
  { id: "club-7", category: "Clubs", text: "Debating Union is an academic club honing the art of persuasion and critical analysis." }
];

function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
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

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGeminiClient();
  const response = await client.models.embedContent({
    model: 'gemini-embedding-2-preview',
    contents: text,
  });
  
  if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
    throw new Error("Failed to generate embedding");
  }
  return response.embeddings[0].values;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must be of same length');
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initializeRAG(): Promise<void> {
  if (isInitialized) {
    return;
  }
  
  // Validate that the client initializes successfully
  getGeminiClient();
  
  console.log("Initializing RAG vector store. This may take a moment...");
  
  for (const item of KNOWLEDGE_BASE) {
    try {
      const embedding = await generateEmbedding(item.text);
      vectorStore.push({
        id: item.id,
        category: item.category,
        text: item.text,
        embedding
      });
    } catch (err: any) {
      console.error(`Failed to generate embedding for doc ${item.id}:`, err?.message);
    }
  }

  isInitialized = true;
  console.log(`RAG initialized with ${vectorStore.length} documents.`);
}

export async function retrieveRelevantContext(userQuery: string, topK: number = 3): Promise<RetrievedChunk[]> {
  if (!isInitialized || vectorStore.length === 0) {
    throw new Error("Vector store is empty or not initialized.");
  }
  
  const queryEmbedding = await generateEmbedding(userQuery);
  
  const scoredChunks = vectorStore.map(doc => {
    return {
      id: doc.id,
      text: doc.text,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    };
  });
  
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
}

export function getVectorStoreSize(): number {
  return vectorStore.length;
}
