/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckSquare, Square, Inbox, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionItemsListProps {
  actionItems: ActionItem[];
}

export default function ActionItemsList({ actionItems }: ActionItemsListProps) {
  // Simple check/uncheck state mapped by task name to make it interactive!
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  if (!actionItems || actionItems.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
        <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="font-semibold text-slate-700">No action items detected</h4>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
          We couldn't detect any structured action items or assignable tasks in this conversation. Takeaways might be informational.
        </p>
      </div>
    );
  }

  // Extract unique task owners for the filter dropdown
  const uniqueOwners = Array.from(
    new Set(actionItems.map(item => item.owner || 'Unassigned'))
  ).filter(owner => owner.trim().length > 0);

  const toggleTaskCompletion = (task: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [task]: !prev[task],
    }));
  };

  const getPriorityStyle = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high') {
      return 'bg-rose-50 text-rose-700 border-rose-100';
    }
    if (p === 'medium') {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    return 'bg-slate-50 text-slate-600 border-slate-250';
  };

  // Filter & Search Logic
  const filteredItems = actionItems.filter(item => {
    const owner = item.owner || 'Unassigned';
    const matchesSearch =
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority =
      priorityFilter === 'all' || item.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    const matchesOwner =
      ownerFilter === 'all' || owner.toLowerCase() === ownerFilter.toLowerCase();

    return matchesSearch && matchesPriority && matchesOwner;
  });

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = actionItems.length > 0
    ? Math.round((completedCount / actionItems.length) * 100)
    : 0;

  return (
    <div id="action-items-section" className="space-y-6 animate-fade-in-up">
      {/* Progress metrics banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-slate-800">
          <div className="p-2.5 bg-slate-50 border border-slate-100 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Action Item Progress Tracker</h4>
            <p className="text-xs text-slate-400">Mark things done as your team ticks off responsibilities</p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex items-center space-x-4 shrink-0">
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-slate-700">{completedCount} of {actionItems.length}</span>
            <span className="text-xs text-slate-400 block">Tasks Completed ({progressPercent}%)</span>
          </div>
          <div className="w-24 sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and search parameters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg outline-hidden text-slate-700 font-sans"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs font-medium py-2 px-3 border border-slate-200 rounded-lg bg-white outline-hidden cursor-pointer text-slate-600 focus:ring-1 focus:ring-blue-100"
          >
            <option value="all">Priority: All</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Owner/Assignee Filter */}
        <div className="shrink-0">
          <select
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
            className="text-xs font-medium py-2 px-3 border border-slate-200 rounded-lg bg-white outline-hidden cursor-pointer text-slate-600 focus:ring-1 focus:ring-blue-100 w-full md:w-auto"
          >
            <option value="all">Assignee: All</option>
            {uniqueOwners.map((owner, oIdx) => (
              <option key={oIdx} value={owner.toLowerCase()}>
                {owner}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No action items matched your current filters.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isCompleted = !!completedTasks[item.task];
            return (
              <div
                key={idx}
                className={`p-4 sm:p-5 flex items-start space-x-4 transition-all duration-150 ${
                  isCompleted ? 'bg-slate-50/50' : 'hover:bg-slate-50/10'
                }`}
              >
                {/* Interactive Checkbox */}
                <button
                  onClick={() => toggleTaskCompletion(item.task)}
                  className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 focus:outline-hidden transition-colors cursor-pointer"
                >
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 space-y-2">
                  <p
                    className={`text-slate-800 text-xs sm:text-sm md:text-base leading-snug font-sans transition-all duration-150 ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {item.task}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                    {/* Owner Badge */}
                    <span className="inline-flex items-center text-xs text-slate-500">
                      Owner: <strong className="ml-1.5 text-slate-700 font-mono text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm">{item.owner || 'Unassigned'}</strong>
                    </span>

                    <span className="text-slate-200 text-xs">|</span>

                    {/* Deadline Badge */}
                    <span className="text-xs text-slate-500">
                      Due: <strong className="text-blue-600 font-mono font-semibold">{item.deadlineMentioned || 'Not Specified'}</strong>
                    </span>

                    <span className="text-slate-200 text-xs">|</span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${getPriorityStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
