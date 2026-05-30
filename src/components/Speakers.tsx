/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Quote, BrainCircuit, Heart, MessageSquare } from 'lucide-react';
import { MeetingAnalysisResult } from '../types';

interface SpeakersProps {
  analysis: MeetingAnalysisResult;
}

export default function Speakers({ analysis }: SpeakersProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  const getSpeakerAvatarBg = (idx: number) => {
    const bgs = [
      'bg-blue-600 text-white',
      'bg-slate-700 text-white',
      'bg-emerald-600 text-white',
      'bg-indigo-600 text-white',
      'bg-amber-600 text-white',
    ];
    return bgs[idx % bgs.length];
  };

  return (
    <div id="speakers-section" className="space-y-6 animate-fade-in-up">
      {/* Speaker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.speakers?.map((speaker, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs ${getSpeakerAvatarBg(idx)} shrink-0`}>
                {getInitials(speaker.name)}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm md:text-base">{speaker.name}</h4>
                <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm inline-block">
                  {speaker.role || 'Contributor'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed antialiased">
                {speaker.summaryOfContribution}
              </p>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-sans border-t border-slate-100 pt-3">
                <Heart className="w-3.5 h-3.5 text-slate-400" />
                <span>Stance: </span>
                <span className="font-medium text-slate-700">{speaker.sentiment || 'Constructive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Board panel */}
      {analysis.keyQuotes && analysis.keyQuotes.length > 0 && (
        <div id="quote-board" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Moments Quote Board</div>
              <p className="text-xs text-slate-400 mt-0.5">Notable verbatim phrases and strategic consequences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {analysis.keyQuotes.map((q, idx) => (
              <div
                key={idx}
                className="relative bg-slate-50/50 border border-slate-200 p-5 rounded-lg flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <div className="text-blue-500 shrink-0">
                  <Quote className="w-8 h-8 opacity-25 rotate-180" />
                </div>
                <div className="space-y-3 flex-1">
                  <p className="text-slate-700 text-xs md:text-sm italic font-sans leading-relaxed">
                    "{q.quote}"
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 pt-3">
                    <div className="text-xs text-slate-500 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      <span className="font-semibold text-slate-800">{q.speaker}</span>
                    </div>
                    <div className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                      <span className="font-bold text-blue-800">Significance:</span> {q.significance}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
