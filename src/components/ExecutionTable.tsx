import React, { useRef, useEffect, useState } from 'react';
import { ListFilter, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { TransitionStep } from '../types/pda';

interface ExecutionTableProps {
  steps: TransitionStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  hasRun?: boolean;
}

export const ExecutionTable: React.FC<ExecutionTableProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  hasRun = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const activeRowRef = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active row into the middle of the table
  useEffect(() => {
    if (activeRowRef.current && tableContainerRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/20 shadow-lg">
      {/* Header with Collapse Toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 bg-[#060b18] border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-[#091124] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
            Compact Execution Log
          </h3>
          <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
            {hasRun ? `${steps.length} Steps Recorded` : 'Ready to Record'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Click row to inspect step
          </span>
          <button className="text-slate-400 hover:text-slate-200">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Body (Collapsible) */}
      {isExpanded && (
        <div
          ref={tableContainerRef}
          className="max-h-52 overflow-y-auto overflow-x-auto text-xs font-mono select-none"
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#070d1e] text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 z-10">
              <tr>
                <th className="py-2 px-3">Step</th>
                <th className="py-2 px-2.5">Input</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Stack (Top → Bottom)</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-4">Explanation / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {steps.map((st, idx) => {
                const isActive = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;
                const stackTopToBottom = [...st.stackAfter].reverse().join(' ');

                let actionBadgeClass = 'bg-slate-800 text-slate-300';
                if (st.action === 'PUSH') {
                  actionBadgeClass = 'bg-sky-950 text-sky-300 border border-sky-600/50';
                } else if (st.action === 'MATCH_POP') {
                  actionBadgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-600/50';
                } else if (st.action === 'REJECT') {
                  actionBadgeClass = 'bg-rose-950 text-rose-300 border border-rose-600/50 font-bold';
                } else if (st.action === 'ACCEPT') {
                  actionBadgeClass = 'bg-emerald-900 text-emerald-200 border border-emerald-500 font-bold';
                } else if (st.action === 'IGNORE_STRING') {
                  actionBadgeClass = 'bg-amber-950/60 text-amber-300/80 border border-amber-800/40';
                }

                return (
                  <tr
                    key={st.step}
                    ref={isActive ? activeRowRef : null}
                    onClick={() => onSelectStep(idx)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-white font-semibold border-l-4 border-cyan-400'
                        : isPast
                        ? 'hover:bg-slate-800/40 text-slate-300'
                        : 'opacity-40 hover:opacity-80 text-slate-400'
                    } ${st.isError ? 'bg-rose-950/30' : ''}`}
                  >
                    <td className="py-1.5 px-3 text-cyan-300 font-bold whitespace-nowrap">
                      {st.step}
                    </td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-black/40 border border-slate-700 text-slate-100 font-bold">
                        {st.displayChar}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${actionBadgeClass}`}>
                        {st.action}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-cyan-300 font-bold whitespace-nowrap">
                      [{stackTopToBottom}]
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <span className={st.stateAfter === 'q_accept' ? 'text-emerald-400 font-bold' : st.stateAfter === 'q_reject' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {st.stateAfter}
                      </span>
                    </td>
                    <td className="py-1.5 px-4 text-xs text-slate-300 font-sans min-w-[260px] truncate max-w-md">
                      {st.isError && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 inline mr-1" />}
                      {st.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
