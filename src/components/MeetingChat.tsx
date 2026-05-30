/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, Send, HelpCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { ChatMessage, MeetingAnalysisResult } from '../types';

interface MeetingChatProps {
  transcript: string;
  analysis: MeetingAnalysisResult;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

const SUGGESTED_PROMPTS = [
  "Summarize the chief decisions and who supported them.",
  "What is the main engineering blocking issue discussed?",
  "List out the task owners and their respective due dates.",
  "Are there any financial exceptions or travel constraints mentioned?"
];

export default function MeetingChat({
  transcript,
  analysis,
  chatHistory,
  onSendMessage,
  isSending,
}: MeetingChatProps) {
  const [inputValue, setInputValue] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest bubbles
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isSending) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestClick = (promptText: string) => {
    if (!isSending) {
      onSendMessage(promptText);
    }
  };

  return (
    <div id="ai-chat-section" className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[520px] overflow-hidden animate-fade-in-up">
      {/* Chat header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex items-center justify-center">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chat Companion</div>
            <p className="text-[11px] text-slate-500">Ask anything about the transcript</p>
          </div>
        </div>
        <div className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-sm">
          Factual
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl max-w-sm shadow-xs">
              <HelpCircle className="w-7 h-7 text-blue-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Explore Key Details</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Need to double-check who promised a task or verify budget metrics? Ask your queries with confidence below.
              </p>
            </div>

            {/* Quick Click Prompts list */}
            <div className="w-full max-w-sm space-y-2 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Suggested Prompts</p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestClick(prompt)}
                    className="w-full text-left p-2.5 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-800 border border-slate-200 text-xs rounded-lg transition-all duration-150 flex items-center justify-between cursor-pointer"
                  >
                    <span className="line-clamp-1">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((message) => {
              const isUser = message.sender === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3.5 shadow-2xs leading-relaxed text-xs sm:text-sm antialiased font-sans ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className={`flex items-center justify-between pb-1.5 border-b mb-1.5 opacity-80 text-[10px] font-mono ${
                      isUser ? 'border-white/20 text-blue-100' : 'border-slate-100 text-slate-400'
                    }`}>
                      <span className="font-bold">{isUser ? 'You' : 'Meeting Brain'}</span>
                      <span>{message.timestamp}</span>
                    </div>

                    <div className="prose prose-sm max-w-none break-words font-sans space-y-1">
                      {message.text.split('\n').map((line, lIdx) => (
                        <p key={lIdx} className="leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading bubble */}
            {isSending && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-slate-200 rounded-lg rounded-bl-none p-4 max-w-[80%] flex items-center space-x-3 text-slate-500 shadow-2xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-xs">Formulating response...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* Inputs area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isSending ? "Formulating response..." : "Query details discussed..."}
          disabled={isSending}
          className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-hidden rounded-lg text-slate-700 font-sans transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !inputValue.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center border border-transparent"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
