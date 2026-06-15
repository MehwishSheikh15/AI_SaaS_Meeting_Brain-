/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TopicTimelineItem {
  topicName: string;
  timestampEstimate: string; // e.g. "00:00 - 05:00" or similar
  keyPoints: string[];
}

export interface SpeakerAnalytic {
  name: string;
  role: string;
  summaryOfContribution: string;
  sentiment: string; // e.g. Supportive, Strategic, Critical
}

export interface DecisionItem {
  decision: string;
  context: string;
  agreedBy: string[];
}

export interface ActionItem {
  task: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  deadlineMentioned: string;
}

export interface KeyQuoteItem {
  speaker: string;
  quote: string;
  significance: string;
}

export interface MeetingAnalysisResult {
  title: string;
  summary: string;
  durationEstimate: string;
  overallSentiment: string;
  topics: TopicTimelineItem[];
  speakers: SpeakerAnalytic[];
  decisions: DecisionItem[];
  actionItems: ActionItem[];
  keyQuotes: KeyQuoteItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SavedMeeting {
  id: string;
  title: string;
  rawTranscript: string;
  createdAt: string;
  analysis: MeetingAnalysisResult;
  chatHistory: ChatMessage[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string; // stored local password representation
  createdAt: string;
  avatarSeed: string; // seed or name to render a specific avatar or icon
}

export interface UserSession {
  user: UserAccount;
  token?: string;
}

