/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, TrendingUp, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { MeetingAnalysisResult } from '../types';

interface DashboardOverviewProps {
  analysis: MeetingAnalysisResult;
}

export default function DashboardOverview({ analysis }: DashboardOverviewProps) {
  const [expandedTopic, setExpandedTopic] = useState<number | null>(0);

  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes('collaborative') || s.includes('positive') || s.includes('alignment')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-100';
    }
    if (s.includes('urgent') || s.includes('tense') || s.includes('pressure')) {
      return 'bg-amber-50 text-amber-800 border-amber-100';
    }
    return 'bg-blue-50 text-blue-800 border-blue-100';
  };

  return (
    <div id="overview-section" className="space-y-6 animate-fade-in-up">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div id="card-duration" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-lg text-blue-600 border border-slate-100">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Duration</p>
            <p className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">{analysis.durationEstimate || 'Not specified'}</p>
          </div>
        </div>

        <div id="card-sentiment" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-lg text-emerald-600 border border-slate-100">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Tone</p>
            <p className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">{analysis.overallSentiment || 'Professional'}</p>
          </div>
        </div>

        <div id="card-topics-count" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-lg text-amber-500 border border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Agenda Topics</p>
            <p className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">{analysis.topics?.length || 0} Covered Sections</p>
          </div>
        </div>
      </div>

      {/* Title & Executive Summary */}
      <div id="card-executive-summary" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Executive Summary
          </div>
          <span className={`chip text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${getSentimentColor(analysis.overallSentiment)}`}>
            {analysis.overallSentiment}
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed text-sm antialiased font-sans">
          {analysis.summary}
        </p>
      </div>

      {/* Interactive Agenda Timeline Map */}
      <div id="timeline-section" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          Chronological Topic Map
        </div>

        <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
          {analysis.topics?.map((topic, idx) => {
            const isExpanded = expandedTopic === idx;
            return (
              <div key={idx} className="relative group animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Timeline node */}
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-all duration-300 ${
                  isExpanded ? 'border-blue-600 ring-4 ring-blue-50 scale-110' : 'border-slate-300 group-hover:border-slate-400'
                }`}></div>

                {/* Topic card container */}
                <div className={`border rounded-lg transition-all duration-300 ${
                  isExpanded 
                    ? 'border-blue-100 bg-blue-50/10 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/20'
                }`}>
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : idx)}
                    className="w-full text-left p-4 flex items-start justify-between focus:outline-hidden cursor-pointer"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">
                          {topic.timestampEstimate || `Section ${idx + 1}`}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors">
                        {topic.topicName}
                      </h4>
                    </div>
                    <div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded bullet details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                      <ul className="space-y-2 mt-2">
                        {topic.keyPoints?.map((bullet, ptIdx) => (
                          <li key={ptIdx} className="flex items-start text-sm text-slate-600">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2.5 shrink-0"></span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
