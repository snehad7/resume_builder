import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  evaluateResumeATSDeterministically,
  generateLocalImprovementSuggestions,
} from './src/utils/atsEvaluator';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Timeout utility to ensure backend never hangs if external AI network is slow or unreachable (25 seconds)
  function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 25000): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('AI request timed out')), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  // Status check endpoint
  app.get('/api/resume-buddy/status', (_req, res) => {
    res.json({
      configured: !!apiKey,
      model: 'gemini-3.8-flash',
    });
  });

  // 1. ATS Readiness Analysis Endpoint
  app.post('/api/resume-buddy/ats', async (req, res) => {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    if (!ai) {
      return res.json({
        configured: false,
        useLocalFallback: true,
        message: 'GEMINI_API_KEY is not configured on the server. Utilizing deterministic ATS evaluation.',
      });
    }

    try {
      const prompt = `You are an expert ATS (Applicant Tracking System) and resume evaluator.
Evaluate the following candidate resume across exactly these 5 key ATS dimensions:
1. Resume structure (headers, contact details, ordering, essential sections)
2. Skills presentation (categorization, technical vs soft skills, keywords, density)
3. Projects and experience (action verbs, quantifiable results/metrics, role scope, achievements)
4. Readability and formatting (bullet density, conciseness, line length, scannability)
5. Parsing considerations (standard headings, semantic fields, date formatting, parseability)

Resume Data (JSON):
${JSON.stringify({
  personal: {
    fullName: resumeData.personal?.fullName,
    title: resumeData.personal?.title,
    email: resumeData.personal?.email,
    phone: resumeData.personal?.phone,
    location: resumeData.personal?.location,
  },
  summary: resumeData.summary,
  experience: (resumeData.experience || []).map((e: any) => ({
    role: e.role || e.title,
    company: e.company,
    startDate: e.startDate,
    endDate: e.endDate,
    highlights: e.highlights,
  })),
  education: (resumeData.education || []).map((ed: any) => ({
    degree: ed.degree,
    institution: ed.institution,
    startDate: ed.startDate,
    endDate: ed.endDate,
  })),
  skills: resumeData.skillCategories,
  projects: (resumeData.projects || []).map((p: any) => ({
    name: p.name || p.title,
    techStack: p.techStack,
    description: p.description,
    highlights: p.highlights,
  })),
  certifications: resumeData.certifications,
})}

Provide:
- overallScore (an integer between 10 and 99 reflecting genuine ATS readiness)
- dimensions (array of 5 objects corresponding to the 5 dimensions above, each with name, score 0-100, status ('good' if >=75, 'average' if >=50, 'needs-attention' if <50), and concise feedback)
- keyStrengths (3 to 5 bullet points of genuine strengths)
- weaknesses (2 to 4 bullet points of weaknesses)
- prioritizedRecommendations (3 to 4 actionable recommendations)`;

      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an objective, encouraging, and accurate ATS resume evaluator. Never invent qualifications not in the resume.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER, description: 'Overall ATS score between 10 and 100' },
                dimensions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      score: { type: Type.INTEGER },
                      status: { type: Type.STRING, description: '"good" | "average" | "needs-attention"' },
                      feedback: { type: Type.STRING },
                    },
                    required: ['name', 'score', 'status', 'feedback'],
                  },
                },
                keyStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                weaknesses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                prioritizedRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['overallScore', 'dimensions', 'keyStrengths', 'weaknesses', 'prioritizedRecommendations'],
            },
          },
        }),
        25000
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        timestamp: Date.now(),
        isAIGenerated: true,
      });
    } catch (err: any) {
      console.warn('Gemini ATS evaluation fallback triggered:', err.message);
      const fallbackResult = evaluateResumeATSDeterministically(resumeData);
      return res.json({
        ...fallbackResult,
        timestamp: Date.now(),
        isAIGenerated: false,
        useLocalFallback: true,
      });
    }
  });

  // 2. Improve My Resume Endpoint
  app.post('/api/resume-buddy/improve', async (req, res) => {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    if (!ai) {
      return res.json({
        configured: false,
        useLocalFallback: true,
        message: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    try {
      // Gather candidate text items for targeted enhancement
      const candidateItems: any[] = [];

      if (resumeData.summary && resumeData.summary.trim().length > 15) {
        candidateItems.push({
          section: 'summary',
          field: 'summary',
          text: resumeData.summary.trim(),
        });
      }

      (resumeData.experience || []).forEach((exp: any) => {
        if (exp.highlights && Array.isArray(exp.highlights)) {
          exp.highlights.forEach((h: string, idx: number) => {
            if (h && h.trim().length > 15) {
              candidateItems.push({
                section: 'experience',
                itemId: exp.id,
                field: 'bullet',
                bulletIndex: idx,
                roleContext: `${exp.role || exp.title} at ${exp.company}`,
                text: h.trim(),
              });
            }
          });
        }
      });

      (resumeData.projects || []).forEach((proj: any) => {
        if (proj.description && proj.description.trim().length > 20) {
          candidateItems.push({
            section: 'projects',
            itemId: proj.id,
            field: 'description',
            roleContext: `Project: ${proj.name || proj.title}`,
            text: proj.description.trim(),
          });
        }
        if (proj.highlights && Array.isArray(proj.highlights)) {
          proj.highlights.forEach((h: string, idx: number) => {
            if (h && h.trim().length > 15) {
              candidateItems.push({
                section: 'projects',
                itemId: proj.id,
                field: 'bullet',
                bulletIndex: idx,
                roleContext: `Project: ${proj.name || proj.title}`,
                text: h.trim(),
              });
            }
          });
        }
      });

      if (candidateItems.length === 0) {
        return res.json({
          suggestions: [],
          message: 'No text content found to improve yet. Add summary, experience or project descriptions first.',
        });
      }

      const prompt = `You are a professional resume writer and career coach.
Analyze the following existing resume text items and propose 3 to 5 concrete, high-impact rewrites.

CRITICAL RULES:
1. Ground all suggestions strictly in the user's actual resume content.
2. NEVER fabricate qualifications, companies, tools, credentials, or metrics that the user did not provide.
3. If adding a quantifiable framework, use existing context or place realistic brackets (e.g. "[X% increase]").
4. Strengthen passive language into vigorous action verbs (e.g., "Engineered", "Architected", "Spearheaded", "Streamlined").
5. The 'originalText' field MUST match the existing text EXACTLY so the user's UI can verify and apply it.

Candidate text items:
${JSON.stringify(candidateItems.slice(0, 10), null, 2)}

Return a list of suggestions.`;

      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You improve resume statements for impact and clarity. Never invent fake qualifications.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  section: { type: Type.STRING, description: '"summary" | "experience" | "projects"' },
                  itemId: { type: Type.STRING, description: 'ID of experience or project if applicable' },
                  field: { type: Type.STRING, description: '"summary" | "description" | "bullet"' },
                  bulletIndex: { type: Type.INTEGER },
                  originalText: { type: Type.STRING, description: 'Exact copy of candidate text' },
                  suggestedText: { type: Type.STRING, description: 'Rewritten impactful version' },
                  reason: { type: Type.STRING, description: 'Why this rewrite improves ATS readiness or readability' },
                },
                required: ['id', 'section', 'field', 'originalText', 'suggestedText', 'reason'],
              },
            },
          },
        }),
        25000
      );

      const suggestions = JSON.parse(response.text || '[]');
      return res.json({
        suggestions,
        timestamp: Date.now(),
        isAIGenerated: true,
      });
    } catch (err: any) {
      console.warn('Gemini suggestions fallback triggered:', err.message);
      const fallbackSuggestions = generateLocalImprovementSuggestions(resumeData);
      return res.json({
        suggestions: fallbackSuggestions,
        timestamp: Date.now(),
        isAIGenerated: false,
        useLocalFallback: true,
      });
    }
  });

  // 3. Conversational Chat Endpoint (Ask Resume Buddy)
  app.post('/api/resume-buddy/chat', async (req, res) => {
    const { message, resumeData, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      return res.json({
        configured: false,
        text: `I'm **Resume Buddy**! To enable full live AI conversational intelligence with Gemini 3.8 Flash, set your \`GEMINI_API_KEY\` in your environment or Secrets panel.\n\nIn the meantime, you can use the **Analyze ATS Readiness** and **Improve My Resume** quick actions which provide comprehensive evaluations!`,
      });
    }

    try {
      const resumeContext = JSON.stringify({
        name: resumeData?.personal?.fullName,
        title: resumeData?.personal?.title,
        summary: resumeData?.summary,
        experienceCount: resumeData?.experience?.length || 0,
        experiences: (resumeData?.experience || []).map((e: any) => ({
          role: e.role || e.title,
          company: e.company,
          years: `${e.startDate} - ${e.endDate || 'Present'}`,
        })),
        skills: (resumeData?.skillCategories || []).map((c: any) => `${c.name}: ${(c.skills || []).join(', ')}`),
        projects: (resumeData?.projects || []).map((p: any) => p.name || p.title),
        education: (resumeData?.education || []).map((ed: any) => `${ed.degree} at ${ed.institution}`),
      });

      const formattedHistory = Array.isArray(history)
        ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Resume Buddy'}: ${h.text}`).join('\n\n')
        : '';

      const prompt = `User Question: "${message}"

Recent Conversation:
${formattedHistory || '(No previous messages)'}

Active Resume Context:
${resumeContext}

Answer the user helpfully, concisely, and practically as Resume Buddy. Ground your response in their active resume where relevant.`;

      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `You are Resume Buddy, a friendly, encouraging, and sharp resume and career coach built into Resuvo.
Help candidates optimize their resume, navigate career changes, write punchy bullet points, and ace ATS filters.
Format your answer using clean markdown (bolding, lists). Be concise and actionable.
Do NOT invent qualifications that are not in their resume context.`,
          },
        }),
        25000
      );

      return res.json({
        text: response.text || 'I could not generate a response right now. Please try again.',
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.warn('Resume Buddy chat fallback triggered:', err.message);
      return res.json({
        text: `I'm here to help you optimize your resume! Here is a core tip based on your question:
- Make sure each accomplishment starts with a strong past-tense action verb (e.g. *Engineered*, *Delivered*, *Architected*).
- Highlight specific measurable outcomes and tools you worked with.
- Use the **Analyze ATS Readiness** tab for an in-depth category breakdown of your current draft.`,
        timestamp: Date.now(),
        fallback: true,
      });
    }
  });

  // Mount Vite or static server
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resuvo server running on http://0.0.0.0:${PORT} (Gemini AI: ${apiKey ? 'Enabled' : 'Key missing'})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Resuvo server:', err);
  process.exit(1);
});
