import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Layers, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { TransitionStep } from '../types/pda';

interface StackVisualizerProps {
  currentStep?: TransitionStep;
  stack: string[]; // bottom to top, e.g. ['$', '{']
  isAccepted: boolean;
  isRejected: boolean;
  className?: string;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = ({
  currentStep,
  stack,
  isAccepted,
  isRejected,
  className = ''
}) => {
  // Delimiters count above the bottom marker '$'
  const activeCount = Math.max(0, stack.length - 1);
  const action = currentStep?.action;

  return (
    <div className={`glass-panel p-5 rounded-2xl flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                PDA Stack Chamber
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  LIFO (Last-In, First-Out)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Gamma Alphabet Γ = {'{ "{", "[", "$" }'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Stack Depth</span>
            <span className="text-sm font-mono font-bold text-cyan-300">
              {activeCount} {activeCount === 1 ? 'element' : 'elements'}
            </span>
          </div>
        </div>

        {/* Current Operation Callout */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#030611] border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400">Operation:</span>
            {action === 'PUSH' && (
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-600/40 animate-pulse">
                PUSH ({currentStep?.pushedSymbol})
              </span>
            )}
            {action === 'MATCH_POP' && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-600/40 animate-pulse">
                MATCH & POP ({currentStep?.poppedSymbol})
              </span>
            )}
            {action === 'REJECT' && (
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-600/40">
                STACK ERROR / REJECT
              </span>
            )}
            {action === 'ACCEPT' && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-600/40">
                EMPTY ($) ACCEPTED
              </span>
            )}
            {(!action || action === 'READ' || action === 'IGNORE_STRING' || action === 'INIT') && (
              <span className="text-xs font-mono text-slate-400">
                {action === 'INIT' ? 'INITIALIZED' : 'Stack Preserved'}
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Top: <strong className="text-slate-200">{stack[stack.length - 1] ?? '$'}</strong>
          </span>
        </div>
      </div>

      {/* Vertical Stack Chamber View */}
      <div className="my-4 relative bg-[#02040b] rounded-xl p-4 border border-slate-800/90 h-64 sm:h-72 flex flex-col justify-end items-center overflow-hidden">
        {/* Top of stack entry arrow marker */}
        <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>TOP OF STACK (Push / Pop Interface)</span>
        </div>

        {/* Backdrop depth lines */}
        <div className="absolute inset-x-8 inset-y-8 border-x border-dashed border-slate-800/60 pointer-events-none" />

        {/* Stack Items (reverse rendered so index 0 '$' is at very bottom) */}
        <div className="w-full max-w-[280px] flex flex-col-reverse items-center gap-2 z-10">
          <AnimatePresence mode="popLayout">
            {stack.map((symbol, idx) => {
              const isTop = idx === stack.length - 1;
              const isBottomMarker = symbol === '$';
              const isObjectBrace = symbol === '{';
              const isArrayBrace = symbol === '[';

              // Color classes according to instructions:
              // Blue for object delimiter '{'
              // Violet for array delimiter '['
              // Muted gray for '$'
              // Red if rejected and this was the offending top
              let colorClass = 'bg-slate-900 border-slate-700 text-slate-400';
              if (isBottomMarker) {
                colorClass = 'bg-slate-900/90 border-slate-700 text-slate-400 shadow-sm';
              } else if (isRejected && isTop) {
                colorClass = 'bg-red-950/90 border-red-500 text-red-200 shadow-lg shadow-red-500/30';
              } else if (isObjectBrace) {
                colorClass = 'bg-blue-950/90 border-blue-400/90 text-blue-200 shadow-md shadow-blue-500/20';
              } else if (isArrayBrace) {
                colorClass = 'bg-violet-950/90 border-violet-400/90 text-violet-200 shadow-md shadow-violet-500/20';
              }

              return (
                <motion.div
                  key={`${symbol}-${idx}`}
                  layout
                  initial={{ y: -40, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -40, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between font-mono font-bold text-base transition-all ${colorClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-black/40 flex items-center justify-center text-xs text-slate-400 font-mono">
                      {idx}
                    </span>
                    <span className="text-lg tracking-wider">{symbol}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">
                      {isBottomMarker ? 'Z₀ Marker' : isObjectBrace ? 'Object Delim' : 'Array Delim'}
                    </span>
                    {isTop && !isBottomMarker && (
                      <span className="text-[9px] font-mono text-cyan-300 font-normal">
                        ← ACTIVE TOP
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Visual stack chamber floor */}
        <div className="w-full max-w-[300px] h-2 bg-gradient-to-r from-cyan-500/20 via-blue-500/40 to-cyan-500/20 rounded-full mt-2" />
      </div>

      {/* LIFO Explanation & Status Bar */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>LIFO Principle:</strong> The most recently opened delimiter is always at the top. 
            When a closing delimiter is read, it must match this top element to be popped off.
          </p>
        </div>

        {/* Result banner if simulation reached final state */}
        {isAccepted && (
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Accepted:</strong> Stack emptied to $ and JSON syntax matches specification.</span>
          </div>
        )}

        {isRejected && (
          <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span><strong>Rejected:</strong> Delimiter mismatch or unclosed nesting detected.</span>
          </div>
        )}
      </div>
    </div>
  );
};
