/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, CheckCircle2, Users } from 'lucide-react';
import { MeetingAnalysisResult } from '../types';

interface DecisionsGridProps {
  analysis: MeetingAnalysisResult;
}

export default function DecisionsGrid({ analysis }: DecisionsGridProps) {
  if (!analysis.decisions || analysis.decisions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
        <Target className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="font-semibold text-slate-700">No decisions detected</h4>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
          We couldn't detect any explicit, firm decisions agreed upon in this dialogue. Ensure your transcript includes definitive resolutions.
        </p>
      </div>
    );
  }

  return (
    <div id="decisions-section" className="space-y-6 animate-fade-in-up">
      {/* Intro info bar */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3 text-slate-800 text-sm">
        <div className="p-1.5 bg-blue-50 rounded-md text-blue-600 border border-blue-100 shrink-0">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-slate-800">Consensus & Resolutions Tracking</p>
          <p className="text-slate-500 text-xs mt-0.5">
            These decisions represent frozen directions agreed upon by the speakers. They serve as historical anchors for future alignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.decisions.map((item, idx) => (
          <div
            key={idx}
            className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-400 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top-right serial indicator */}
            <span className="absolute top-4 right-4 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-sm">
              DEC-{String(idx + 1).padStart(2, '0')}
            </span>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 pr-16">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {item.decision}
                  </h4>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Resolution achieved</p>
                </div>
              </div>

              {/* Context Block */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Context / Driver</p>
                <p className="text-slate-600 text-xs leading-relaxed">{item.context}</p>
              </div>
            </div>

            {/* Co-signed Speakers bottom panel */}
            {item.agreedBy && item.agreedBy.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Aligned Participants</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {item.agreedBy.map((person, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-[10px] font-bold rounded-sm border border-slate-200 transition-colors cursor-default"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
