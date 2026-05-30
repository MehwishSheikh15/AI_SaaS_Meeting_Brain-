/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Upload,
  Calendar,
  Sparkles,
  ClipboardList,
  Target,
  Users,
  MessageSquare,
  PlusCircle,
  FileText,
  Trash2,
  ListRestart,
  HelpCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  History,
  X,
  ArrowRight
} from 'lucide-react';

import { SAMPLE_TRANSCRIPTS } from './data/samples';
import { MeetingAnalysisResult, ChatMessage, SavedMeeting } from './types';
import DashboardOverview from './components/DashboardOverview';
import Speakers from './components/Speakers';
import DecisionsGrid from './components/DecisionsGrid';
import ActionItemsList from './components/ActionItemsList';
import MeetingChat from './components/MeetingChat';

const STORAGE_KEY = 'meeting-brain-reports-v1';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'speakers' | 'decisions' | 'actionItems'>('overview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loaded analytics context
  const [activeMeeting, setActiveMeeting] = useState<SavedMeeting | null>(null);
  
  // Stored meeting reports history (local persistence)
  const [historyList, setHistoryList] = useState<SavedMeeting[]>([]);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  // Chat conversation parameters
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const rawSaved = localStorage.getItem(STORAGE_KEY);
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved) as SavedMeeting[];
        setHistoryList(parsed);
        // Pre-load the latest meeting analyzed if history exists
        if (parsed.length > 0) {
          setActiveMeeting(parsed[0]);
          setChatHistory(parsed[0].chatHistory || []);
        }
      } catch (err) {
        console.error('Failed to parse meeting brain local history:', err);
      }
    }
  }, []);

  // Sync historical records back to local storage when changed
  const saveToHistory = (newList: SavedMeeting[]) => {
    setHistoryList(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  // Preset sample transcript selector click handler
  const handleSelectSample = (sampleId: string) => {
    const selected = SAMPLE_TRANSCRIPTS.find(s => s.id === sampleId);
    if (selected) {
      setInputText(selected.transcript);
      setErrorMessage(null);
    }
  };

  // Main call to trigger AI extraction
  const handleAnalyzeTranscriptSubmit = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please paste or select a target transcript to analyze.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStage('Initiating connection with server...');

    // Simulate animated extraction stages for exquisite user design feedback
    const stages = [
      'Segmenting dialogue and contributions...',
      'Mapping participant roles & sentiment states...',
      'Highlighting unanimous corporate decisions...',
      'Refining itemized action checklist delegators...',
      'Assembling analytical executive briefing...'
    ];

    let currentStageIndex = 0;
    const stageTimer = setInterval(() => {
      if (currentStageIndex < stages.length) {
        setAnalysisStage(stages[currentStageIndex]);
        currentStageIndex++;
      }
    }, 1200);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: inputText })
      });

      clearInterval(stageTimer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server encountered an issue extracting insights.');
      }

      const responseData = await response.json();
      const newAnalysis: MeetingAnalysisResult = responseData.report;

      const randomId = 'meeting-' + Math.random().toString(36).substring(2, 9);
      const newSavedMeeting: SavedMeeting = {
        id: randomId,
        title: newAnalysis.title || 'Extracted Meeting Insight',
        rawTranscript: inputText,
        createdAt: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        analysis: newAnalysis,
        chatHistory: []
      };

      const updatedHistory = [newSavedMeeting, ...historyList];
      saveToHistory(updatedHistory);
      setActiveMeeting(newSavedMeeting);
      setChatHistory([]);
      setActiveTab('overview');
      setInputText(''); // Clear input for next potential uploads
    } catch (err: any) {
      clearInterval(stageTimer);
      console.error('Error conducting analysis:', err);
      setErrorMessage(
        err.message || 'An unexpected runtime compilation error occurred. Check that GEMINI_API_KEY is properly initialized.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Conversational grounded dialogue submit
  const handleSendChatMessage = async (text: string) => {
    if (!activeMeeting || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: activeMeeting.rawTranscript,
          analysis: activeMeeting.analysis,
          chatHistory: updatedHistory,
          userMessage: text
        })
      });

      if (!response.ok) {
        throw new Error('Could not achieve dialogue resonance.');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };

      const finalHistory = [...updatedHistory, assistantMsg];
      setChatHistory(finalHistory);

      // Save dialogue progression on current active meeting file
      const updatedMeetings = historyList.map(m => {
        if (m.id === activeMeeting.id) {
          return { ...m, chatHistory: finalHistory };
        }
        return m;
      });
      saveToHistory(updatedMeetings);
      setActiveMeeting(prev => prev ? { ...prev, chatHistory: finalHistory } : null);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: 'msg-err',
        sender: 'assistant',
        text: 'My apologies, I ran into operational latency answering your prompt properly. Please check your network parameters and retry.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory([...updatedHistory, errMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Delete single meeting report from history list
  const handleDeleteReport = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent reload triggering
    const updated = historyList.filter(m => m.id !== idToDelete);
    saveToHistory(updated);

    if (activeMeeting?.id === idToDelete) {
      if (updated.length > 0) {
        setActiveMeeting(updated[0]);
        setChatHistory(updated[0].chatHistory || []);
      } else {
        setActiveMeeting(null);
        setChatHistory([]);
      }
    }
  };

  // Quick launch clear of full workspace results to analyze something new
  const handleCreateNewAnalysis = () => {
    setActiveMeeting(null);
    setChatHistory([]);
    setInputText('');
    setErrorMessage(null);
  };

  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-all">
      
      {/* Primary Brand Navbar Header */}
      <header id="primary-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">Meeting Brain</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Expert meeting intelligence & actionable analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick action button to trigger a pristine upload workspace */}
            {activeMeeting && (
              <button
                onClick={handleCreateNewAnalysis}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-105/50 border border-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">New Analysis</span>
              </button>
            )}

            {/* History Toggle */}
            <button
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 border border-slate-200/50 rounded-lg transition-colors cursor-pointer"
              title="Toggle historical repository"
            >
              <History className="w-4.5 h-4.5" />
              {historyList.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border border-white animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main application workspace row */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 relative">
        
        {/* Historical side repository list panel drawer */}
        {showHistorySidebar && (
          <aside className="w-full md:w-80 bg-white border border-slate-200 rounded-xl p-4 shrink-0 flex flex-col shadow-xs animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <History className="w-4 h-4 text-slate-500" />
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processed Repository</div>
              </div>
              <button 
                onClick={() => setShowHistorySidebar(false)}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] md:max-h-[500px]">
              {historyList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  Your analyzed meeting storage is empty. Create your first briefing!
                </div>
              ) : (
                historyList.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => {
                      setActiveMeeting(meeting);
                      setChatHistory(meeting.chatHistory || []);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      activeMeeting?.id === meeting.id
                        ? 'border-blue-500 bg-blue-50/20 shadow-2xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{meeting.title}</p>
                      <button
                        onClick={(e) => handleDeleteReport(meeting.id, e)}
                        className="text-slate-300 hover:text-rose-500 p-0.5 rounded-sm transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium mt-2">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{meeting.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* LOADING SHIELD COVER */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-50 bg-slate-50/90 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white px-8 py-10 rounded-xl border border-slate-200 shadow-sm max-w-sm space-y-6 flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 text-base">Processing Intelligence</h3>
                <p className="text-[10px] text-blue-600 tracking-wider uppercase font-mono font-bold animate-pulse">
                  {analysisStage}
                </p>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                Meeting Brain is studying speaking density, tracking resolution checkpoints, and compiling actionable execution tasks...
              </p>
            </div>
          </div>
        )}

        {/* WORKSPACE AREA */}
        <div id="core-utility-workspace" className="flex-1 flex flex-col min-w-0">
          
          {/* STATE A: NO ACTIVE MEETING REPORT LOADED -> Paste and upload screen */}
          {!activeMeeting ? (
            <div id="blank-slate-upload" className="max-w-3xl mx-auto w-full space-y-8 py-4 animate-fade-in-up">
              
              {/* Marketing Brand Intro Card */}
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl mb-2 shadow-2xs">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Convert Dialogue into Corporate Action</h2>
                <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-sans">
                  Paste raw text transcripts or mock conversations to immediately outline core decisions, speaker roles, timelines, and prioritized checklists with owners.
                </p>
              </div>

              {/* Sample Selector row */}
              <div id="sample-picker-block" className="space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Pick a sample transcript below to quick-test "Meeting Brain"</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {SAMPLE_TRANSCRIPTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample.id)}
                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-slate-50/50 text-left transition-all duration-150 outline-hidden flex flex-col justify-between space-y-3 group cursor-pointer shadow-3xs"
                    >
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 line-clamp-1">
                          {sample.title}
                        </h4>
                        <p className="text-slate-400 text-[11px] line-clamp-3 mt-1 leading-relaxed">
                          {sample.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 flex items-center group-hover:underline">
                        Load Draft <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Text Form Area */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center">
                    <Upload className="w-4 h-4 text-slate-405 mr-2" /> Paste Transcription
                  </span>
                  <button
                    onClick={() => setInputText('')}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Clear text field"
                  >
                    <ListRestart className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste raw conversation lines here, including timeline headers or speaker names, e.g.:&#10;[00:03] Sarah: We need to launch wide on Wednesday...&#10;[00:45] Marcus: I agree, the cloud scaling looks solid..."
                  rows={9}
                  className="w-full p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-hidden rounded-lg text-xs font-mono leading-relaxed"
                />

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-2.5 text-rose-800 text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 m-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Execution Prevented</p>
                      <p className="text-rose-700 font-sans">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyzeTranscriptSubmit}
                  disabled={!inputText.trim()}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-sm rounded-lg select-none hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer border border-transparent"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Examine & Structurize Transcript</span>
                </button>
              </div>
            </div>
          ) : (
            
            /* STATE B: ACTIVE MEETING REPORT LOADED -> Split workspace dashboard */
            <div id="active-briefing-dashboard" className="space-y-6">
              
              {/* Meeting Banner Header */}
              <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">{activeMeeting.createdAt}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 leading-tight">
                    {activeMeeting.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0 col-auto">
                  <span className="chip bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    Analysis Ready
                  </span>
                  <button
                    onClick={handleCreateNewAnalysis}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-3xs border border-transparent"
                  >
                    Analyze New Segment
                  </button>
                </div>
              </div>

              {/* Split Content layout (70% Tab sections / 30%grounded Chat companion) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Active Analysis Dashboard Tabs Column (70%) */}
                <div id="active-tabs-column" className="lg:col-span-8 space-y-4">
                  
                  {/* Tabs bar */}
                  <div className="flex border border-slate-200 overflow-x-auto gap-1 bg-white p-1 rounded-xl shadow-3xs">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-4 py-2 text-xs font-bold shrink-0 rounded-lg transition-all cursor-pointer flex items-center space-x-2 border border-transparent ${
                        activeTab === 'overview'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Executive Overview</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('speakers')}
                      className={`px-4 py-2 text-xs font-bold shrink-0 rounded-lg transition-all cursor-pointer flex items-center space-x-2 border border-transparent ${
                        activeTab === 'speakers'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Speakers & Quotes</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('decisions')}
                      className={`px-4 py-2 text-xs font-bold shrink-0 rounded-lg transition-all cursor-pointer flex items-center space-x-2 border border-transparent ${
                        activeTab === 'decisions'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Decisions Matrix</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('actionItems')}
                      className={`px-4 py-2 text-xs font-bold shrink-0 rounded-lg transition-all cursor-pointer flex items-center space-x-2 border border-transparent ${
                        activeTab === 'actionItems'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Action Items</span>
                    </button>
                  </div>

                  {/* Render targeted tab panel content */}
                  <div id="tab-analytics-drawer" className="min-h-[400px]">
                    {activeTab === 'overview' && (
                      <DashboardOverview analysis={activeMeeting.analysis} />
                    )}

                    {activeTab === 'speakers' && (
                      <Speakers analysis={activeMeeting.analysis} />
                    )}

                    {activeTab === 'decisions' && (
                      <DecisionsGrid analysis={activeMeeting.analysis} />
                    )}

                    {activeTab === 'actionItems' && (
                      <ActionItemsList actionItems={activeMeeting.analysis.actionItems} />
                    )}
                  </div>
                </div>

                {/* Grounded interactive chat companion Column (30%) */}
                <div id="interactive-chat-column" className="lg:col-span-4">
                  <div className="sticky top-20">
                    <MeetingChat
                      transcript={activeMeeting.rawTranscript}
                      analysis={activeMeeting.analysis}
                      chatHistory={chatHistory}
                      onSendMessage={handleSendChatMessage}
                      isSending={isSendingChat}
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* Styled Footer */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 py-4 mt-auto text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Meeting Brain AI. Powered by <strong className="text-slate-600 font-semibold">Mehwish Sheikh</strong>. All rights reserved.</p>
          <p className="font-mono text-[10px] text-slate-400">Secure & Factual Analysis Engine</p>
        </div>
      </footer>

    </div>
  );
}
