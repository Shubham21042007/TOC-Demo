import React from 'react';
import { CheckCircle2, XCircle, Layers, Check, X, MapPin } from 'lucide-react';
import type { SimulationResult } from '../types/pda';

interface ResultBannerProps {
  result: SimulationResult;
  totalSteps: number;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  result,
  totalSteps
}) => {
  const isAccepted = result.isAccepted;

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        isAccepted
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 shadow-lg shadow-emerald-950/50'
          : 'bg-rose-950/40 border-rose-500/40 text-rose-100 shadow-lg shadow-rose-950/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {isAccepted ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="font-display font-bold text-base tracking-wide flex items-center gap-2">
              {isAccepted ? 'VALID JSON — ACCEPTED' : 'INVALID JSON — REJECTED'}
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isAccepted ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/50' : 'bg-rose-900/80 text-rose-300 border border-rose-600/50'
              }`}>
                {isAccepted ? 'q_accept' : 'q_reject'}
              </span>
            </span>
            <p className="text-xs opacity-80 mt-0.5">
              {isAccepted
                ? 'Both PDA stack balance and complete RFC 8259 JSON grammar rules verified.'
                : result.errorMessage || 'Encountered delimiter mismatch or syntax error.'}
            </p>
          </div>
        </div>

        {/* Total Steps & Stack */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-slate-300">
            Total Steps: <strong>{totalSteps}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-black/40 border border-white/10 text-cyan-300">
            Final Stack: <strong>[{result.finalStack.join(', ')}]</strong>
          </span>
        </div>
      </div>

      {/* Checks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2.5 text-xs font-mono">
        {/* Check 1: PDA Structural Check */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            PDA Structural Check:
          </span>
          <span className={`font-bold flex items-center gap-1 ${
            result.pdaStructuralValid ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {result.pdaStructuralValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {result.pdaStructuralValid ? 'PASSED' : 'FAILED'}
          </span>
        </div>

        {/* Check 2: JSON Syntax Check */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
          <span className="text-slate-300">JSON Syntax Check:</span>
          <span className={`font-bold flex items-center gap-1 ${
            result.jsonSyntaxValid ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {result.jsonSyntaxValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {result.jsonSyntaxValid ? 'PASSED' : 'FAILED'}
          </span>
        </div>

        {/* Check 3: Error Position (if invalid) */}
        {!isAccepted && result.errorPosition && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5 text-rose-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Error Position:
            </span>
            <span className="font-bold">
              Line {result.errorPosition.line}, Col {result.errorPosition.column}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
