import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Layers, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div id="how-it-works" className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 bg-[#060b18] hover:bg-[#0a1226] flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
            How It Works — Automata & Stack Verification
          </span>
          <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            TOC Quick Summary
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? 'Collapse' : 'Expand details'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-4 text-xs text-slate-300 border-t border-slate-800/80 bg-[#040713]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Why Push */}
            <div className="p-3.5 rounded-xl bg-[#060b18] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono text-xs">
                <Layers className="w-4 h-4" />
                <span>1. Why Push Delimiters?</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Encountering an opening delimiter (<code>{'{'}</code> or <code>[</code>) outside a string begins a new nested scope. Pushing it onto the stack records that an unclosed scope is active.
              </p>
            </div>

            {/* 2. Why Pop */}
            <div className="p-3.5 rounded-xl bg-[#060b18] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-semibold font-mono text-xs">
                <Terminal className="w-4 h-4" />
                <span>2. Why Pop Delimiters?</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Encountering a closing delimiter (<code>{'}'}</code> or <code>]</code>) must match the exact delimiter at the top of the stack. If it matches, popping removes the completed scope; otherwise the input is rejected immediately.
              </p>
            </div>

            {/* 3. LIFO Principle */}
            <div className="p-3.5 rounded-xl bg-[#060b18] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono text-xs">
                <Sparkles className="w-4 h-4" />
                <span>3. The LIFO Principle</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Because innermost nested structures must close before outer structures (e.g. <code>{'{ [ ] }'}</code>), <strong>Last-In, First-Out (LIFO)</strong> perfectly mirrors hierarchical nesting without needing a full Turing machine.
              </p>
            </div>

            {/* 4. Complete Syntax */}
            <div className="p-3.5 rounded-xl bg-[#060b18] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Complete Syntax Check</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                A stack confirms bracket balancing (the Dyck language). However, complete JSON validation also requires grammar checks (no trailing commas, properly quoted keys, valid literals). Both checks must pass!
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
