/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

// Enable JSON bodies with higher limits for large meeting transcripts
app.use(express.json({ limit: '15mb' }));

// Lazy initialised Gemini Client
let googleGenAI: GoogleGenAI | null = null;

function getGoogleGenAI(): GoogleGenAI {
  if (!googleGenAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in the Settings > Secrets panel on Google AI Studio.');
    }
    googleGenAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return googleGenAI;
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Segment meeting transcript to structured schema
app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      res.status(400).json({ error: 'Please submit a non-empty meeting transcript.' });
      return;
    }

    const ai = getGoogleGenAI();

    const prompt = `Analyze the provided meeting transcript. Your main job is to convert it into structured executive intelligence.

CRITICAL DIRECTIVES:
1. Do not add explanations, interpretations, or inferred conclusions. Only state facts explicitly present inside the transcript itself.
2. If details (such as specific deadlines, speaker roles, titles, context, or decisions) are not explicitly named or mentioned in the transcript, or if something is unclear, you must write "Not mentioned" exactly. Do not estimate, guess, or infer from context.
3. Keep summaries of contributions, topics, and overall sections fully objective, describing only explicitly stated facts.
4. Output must match the exact JSON schema provided.

Here is the meeting transcript to analyze:
------------------------------------------
${transcript}
------------------------------------------`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are "Meeting Brain", an expert corporate meeting intelligence analyst. You specialize in pulling high-value decisions, action-item tasks with owners, and speaker profiles from dialogues. You strictly operate under a zero-inference policy: do not add explanations, interpretations, or inferred conclusions. Only state facts explicitly present inside the transcript; if any field or details are unclear or not mentioned, write "Not mentioned" exactly.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'title',
            'summary',
            'durationEstimate',
            'overallSentiment',
            'topics',
            'speakers',
            'decisions',
            'actionItems',
            'keyQuotes'
          ],
          properties: {
            title: {
              type: Type.STRING,
              description: 'Concise corporate title for the meeting.'
            },
            summary: {
              type: Type.STRING,
              description: 'Executive paragraph summary highlighting core discussions, accomplishments, or strategic focus.'
            },
            durationEstimate: {
              type: Type.STRING,
              description: 'Estimated standard duration based on timestamp markers or token conversation density (e.g. "5 minutes", "30 minutes").'
            },
            overallSentiment: {
              type: Type.STRING,
              description: 'E.g., "Collaborative", "Relieved but busy", "Urgent & decision-focused", "Strategic alignment".'
            },
            topics: {
              type: Type.ARRAY,
              description: 'Sequence of strategic blocks or agendas discussed in temporal order.',
              items: {
                type: Type.OBJECT,
                required: ['topicName', 'timestampEstimate', 'keyPoints'],
                properties: {
                  topicName: { type: Type.STRING, description: 'E.g., Database deadlock bug debug, APAC scale.' },
                  timestampEstimate: { type: Type.STRING, description: 'Chronological sector, e.g. "00:00 - 02:15" or "First half".' },
                  keyPoints: {
                    type: Type.ARRAY,
                    description: 'Bullet points outlining this topic\'s key discussions.',
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            speakers: {
              type: Type.ARRAY,
              description: 'List of all conversation contributors mapped to their inferred or stated roles.',
              items: {
                type: Type.OBJECT,
                required: ['name', 'role', 'summaryOfContribution', 'sentiment'],
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: 'A realistic corporate role, e.g., CFO, Principal Architect, Senior PM, Operations Lead.' },
                  summaryOfContribution: { type: Type.STRING, description: 'Clear statement of their concerns, proposals, or contributions.' },
                  sentiment: { type: Type.STRING, description: 'Their stance or tone, e.g. "Supportive & accommodating", "Pragmatic & metric-driven", "Anxious but solutions-oriented".' }
                }
              }
            },
            decisions: {
              type: Type.ARRAY,
              description: 'Key formal or informal resolutions achieved during the meeting.',
              items: {
                type: Type.OBJECT,
                required: ['decision', 'context', 'agreedBy'],
                properties: {
                  decision: { type: Type.STRING, description: 'E.g., Approved one Singapore hiring exception instead of two; Travel budget cut by 20%.' },
                  context: { type: Type.STRING, description: 'Strategic background for this decision.' },
                  agreedBy: {
                    type: Type.ARRAY,
                    description: 'List of speakers participating or expressing consent.',
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            actionItems: {
              type: Type.ARRAY,
              description: 'Detailed, actionable tasks.',
              items: {
                type: Type.OBJECT,
                required: ['task', 'owner', 'priority', 'deadlineMentioned'],
                properties: {
                  task: { type: Type.STRING, description: 'Action-oriented task description.' },
                  owner: { type: Type.STRING, description: 'Name of the designated owner (e.g. "Marcus"), team, or "Unassigned".' },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  deadlineMentioned: { type: Type.STRING, description: 'E.g. "Wednesday afternoon", "Friday, June 5th", or "Not specified".' }
                }
              }
            },
            keyQuotes: {
              type: Type.ARRAY,
              description: 'Critical memorable quotes verbatim or close to text that represent key turning points.',
              items: {
                type: Type.OBJECT,
                required: ['speaker', 'quote', 'significance'],
                properties: {
                  speaker: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  significance: { type: Type.STRING, description: 'Why this quote is vital for context.' }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('AI returned an empty response.');
    }

    // Return the clean, parsed object as JSON directly
    const reportData = JSON.parse(outputText.trim());
    res.json({ report: reportData, rawText: outputText });
  } catch (error: any) {
    console.error('Extraction Error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during transcript analytics.',
      details: error.toString()
    });
  }
});

// Dynamic Grounded Meeting Q&A Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { transcript, analysis, chatHistory, userMessage } = req.body;
    if (!transcript || !userMessage) {
      res.status(400).json({ error: 'Missing transcript or userMessage.' });
      return;
    }

    const ai = getGoogleGenAI();

    const conversationContext = chatHistory && chatHistory.length > 0
      ? chatHistory.map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
      : '(No previous dialogue)';

    const prompt = `You are "Meeting Brain", an expert AI meeting intelligence assistant.
Your goal is to answer the user's question about the meeting.

SOCIETY RULES FOR ACCURACY:
- Ground your answer strictly and exclusively in the provided raw meeting transcript and structured insights.
- Do not add explanations, interpretations, or inferred conclusions. Only state facts explicitly present in the transcript.
- If a question asks about details or information not explicitly mentioned in the transcript, or if something is unclear, write "Not mentioned" exactly, or state that the detail is "Not mentioned".

------------------------------------------
RAW MEETING TRANSCRIPT:
${transcript}
------------------------------------------
EXTRACTED INSIGHTS:
${JSON.stringify(analysis, null, 2)}
------------------------------------------
CONVERSATION BACKGROUND:
${conversationContext}
------------------------------------------
LATEST USER QUESTION:
${userMessage}

Please write your concise, factual response in standard Markdown layout:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Meeting Brain. You answer queries on facts explicitly specified within the transcript context. Do not add explanations, interpretations, or inferred conclusions. Only state facts explicitly present in the transcript. If something is unclear or not explicitly mentioned, write "Not mentioned".',
        temperature: 0.1
      }
    });

    res.json({ answer: response.text || 'Unable to generate response.' });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during dialogue reasoning.',
      details: error.toString()
    });
  }
});

// Vite/Static asset loading pipelines
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Meeting Brain] Service booting on http://0.0.0.0:${PORT}`);
  });
}

// Only start the server if not running inside a Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
