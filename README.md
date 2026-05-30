# Meeting Brain AI
### Designed & Developed by Mehwish Sheikh

**Meeting Brain AI** is an enterprise-grade AI-powered SaaS assistant designed to automatically capture raw transcripts, convert dialogues into structured corporate intelligence (summaries, items, decisions, topics), and host an active Retrieval-Augmented Generation (RAG) factual chat companion. It is engineered with a strict zero-hallucination factual grounding engine to ensure high-fidelity insights.

---

## 🚀 1. Product Overview
Meeting Brain AI eliminates the manual overhead of summarizing meetings, chasing down action item confirmations, and reviewing past dialogue records.

- **Target Audience**: SaaS product managers, software development teams, executive leads, and corporate secretaries who require crisp, auditable outcomes from busy syncs.
- **Core Value Proposition**: Transform messy, fragmented raw dialogue into a single structured source of truth, where every decision and action item is extracted with absolute precision. All insights are queryable in real-time via a fact-grounded chat companion.

---

## 🛠️ 2. Core SaaS Features
1. **Multi-Meeting Historical Repository**: Sidebar history controller to save, swap, and delete analyzed meeting sessions.
2. **Robust Categorized Analytics**:
   - **🧾 Summary**: Automatically compile clear, highly readable bullet points.
   - **👥 Speaker Dynamic Maps**: Profiles each individual speaker, analyzing speaking density, contributions, and primary sentiment.
   - **✅ Key Decisions**: Isolates final, binding strategic decisions.
   - **📌 Action Items Grid**: Installs clear checklists listing the tasks, assigned owners, and explicit deadlines.
3. **Factual Grounded Chat Companion**: Interactive conversation space utilizing real-time transcript querying. The chat system operates under a strict zero-inference policy, replying strictly to facts.
4. **Draft Sandboxing**: Built-in sample selector templates to quickly test system responsiveness across varied corporate circumstances.

---

## 🏗️ 3. System Architecture & Working Pipeline
Meeting Brain AI uses a robust full-stack model. The visual dashboard interacts with a Node.js Express server which interfaces with modern generative models to structure raw inputs and support chat Q&A.

### 🔄 The Working Pipeline:
```
[User Upload/Paste] 
       │
       ▼
[Express Server Endpoint (/api/analyze)] 
       │
       ├─► [AI Intelligence Layer (Generative Model)]
       │         │
       │         ▼ (Failsafe Zero-Inference Parsing JSON Schema)
       │   [Structured Meeting Analysis Output]
       │
       ▼
[Storage & Repository (Database state)]
       │
       ▼
[Interactive Factual Chat Companion (/api/chat)]
       │ ◄─── (Factual Context-Grounding Constraint)
       ▼
[Markdown-rendered Client UI]
```

---

## 🗄️ 4. Data Models / Database Design
This application utilizes a structured relational database model to manage multi-tenant SaaS workloads:

### `users` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, Default: gen_random_uuid() | Unique identifier for each user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Account email address |
| `password_hash`| VARCHAR(255) | NOT NULL | Secure salted password hash |
| `created_at` | TIMESTAMPTZ | Default: NOW() | Signup date and time |

### `meetings` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique meeting identifier |
| `user_id` | UUID | FOREIGN KEY REFERENCES `users(id)` | Owner of the report |
| `title` | VARCHAR(255) | NOT NULL | Extracted or custom meeting title |
| `raw_transcript`| TEXT | NOT NULL | Absolute raw transcription input |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation and parsing date |

### `action_items` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique item index |
| `meeting_id` | UUID | FOREIGN KEY REFERENCES `meetings(id)` | Parent meeting reference |
| `task` | TEXT | NOT NULL | Visual duty message |
| `owner` | VARCHAR(100) | Default: 'Unassigned' | Person or team designated |
| `deadline` | VARCHAR(100) | Default: 'Not specified' | Due date specified in dialogue |
| `status` | VARCHAR(50) | Default: 'Pending' | Current progress status |

---

## 🧠 5. Production AI Prompt Systems
Meeting Brain AI uses production-grade prompt templates constructed with rigid guidelines to prevent hallucination.

### A. Summary & Action Parsing Prompt
```text
Analyze the provided meeting transcript. Your main job is to convert it into structured executive intelligence.

CRITICAL DIRECTIVES:
1. Do not add explanations, interpretations, or inferred conclusions. Only state facts explicitly present inside the transcript itself.
2. If details (such as specific deadlines, speaker roles, titles, context, or decisions) are not explicitly named or mentioned in the transcript, or if something is unclear, you must write "Not mentioned" exactly. Do not estimate, guess, or infer from context.
3. Keep summaries of contributions, topics, and overall sections fully objective, describing only explicitly stated facts.
4. Output must match the exact JSON schema provided.
```

### B. Chat Grounding RAG Prompt
```text
SOCIETY RULES FOR ACCURACY:
- Ground your answer strictly and exclusively in the provided raw meeting transcript and structured insights.
- Do not add explanations, interpretations, or inferred conclusions. Only state facts explicitly present in the transcript.
- If a question asks about details or information not explicitly mentioned in the transcript, or if something is unclear, write "Not mentioned" exactly, or state that the detail is "Not mentioned".
```

---

## ⚡ 6. API Design Specifications

### 📥 `POST /api/analyze`
- **Description**: Parses a raw text transcript, runs safety-aligned LLM structuring, and returns processed meeting deliverables.
- **Request Body**:
  ```json
  {
    "title": "Project Alpha Status Sync",
    "transcript": "[00:15] Mary: We will change the release to next Thursday..."
  }
  ```
- **Response Format (JSON)**:
  ```json
  {
    "id": "meeting-uuid-string",
    "title": "Project Alpha Status Sync",
    "createdAt": "2026-05-30",
    "rawTranscript": "[00:15] Mary: We...",
    "analysis": {
      "summary": ["Decided to delay the release schedule by 1 week."],
      "topics": ["Timeline Adjustment", "QA testing limits"],
      "decisions": [
        {
          "id": "dec-1",
          "decision": "Delay release date until next Thursday",
          "context": "Mary announced the postponement to accommodate QA constraints."
        }
      ],
      "actionItems": [
        {
          "id": "act-1",
          "task": "Perform regression test suite",
          "owner": "QA Team",
          "deadline": "Not specified"
        }
      ],
      "speakers": [
        {
          "name": "Mary",
          "role": "Not mentioned",
          "sentiment": "Neutral",
          "density": 45,
          "contribution": "Announced release adjustment details."
        }
      ]
    }
  }
  ```

### 💬 `POST /api/chat`
- **Description**: Submits a prompt to the RAG grounding chat.
- **Request Body**:
  ```json
  {
    "transcript": "[00:15] Mary: We will...",
    "userMessage": "Who decided to delay the release schedule?",
    "chatHistory": []
  }
  ```
- **Response Format**:
  ```json
  {
    "reply": "According to the transcript, Mary announced the decision to delay the release schedule until next Thursday."
  }
  ```

---

## 🌐 7. Vercel Deployment Instructions

### Can this project be deployed directly to Vercel?
**Yes!** However, because this is a **Full-Stack Application** (Vite on the frontend + Express on the backend), you have two distinct paths forward:

---

### Option A: Static Deployment (Frontend Only)
If you only need to host the React client-side app on Vercel while running your API server elsewhere:
1. In the Vercel Dashboard, select **Add New > Project** and link your Git repository.
2. In the Build & Development settings, select **Vite** as your preset.
3. Configure the **Build Command** to: `npm run build:client` (or simply `vite build`) if building client-only.
4. Set the **Output Directory** to `dist`.
5. Add your client-side environment variables prefixed with `VITE_` in Vercel's environment variables dashboard.

---

### Option B: Full-Stack Serverless Deployment on Vercel (Recommended)
To host both the React frontend and the Express routing endpoints `/api/*` completely under a single Vercel deployment, you must utilize **Vercel Serverless Functions**.

Follow these exact steps:

#### 1. Add Vercel Routing Configuration
Create a `vercel.json` file in the root directory to route client traffic to the index file and API calls to your entry server:
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

#### 2. Adapt the Server for Serverless Context
In a standard container environment, the Express server calls `app.listen(3000)`. In Vercel serverless functions, the function is executed on-demand and exported instead of running continuously.

Create an `/api/server.js` file to adapt the app:
```javascript
import app from '../server.ts'; // Import your Express app setup (without the app.listen block)
export default app;
```

#### 3. Environment Variable Provisioning
In the Vercel dashboard, make sure to add your secret variables:
- `GEMINI_API_KEY`: Your key from Google Studio, so the backend can securely run predictions.

---

### Alternative Deployment Options for Full-Stack Node.js
If you prefer standard long-running Node.js processes instead of serverless functions:
- **Render / Railway / Heroku**: These platforms natively build and run your full-stack container on the standard `npm run build && npm start` script, which compiles your Express server bundle beautifully via `esbuild` using our streamlined architecture!
