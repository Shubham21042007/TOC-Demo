import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, ArrowDown, BookOpen, Layers, CheckCircle2, RotateCcw } from 'lucide-react';

interface HeroSectionProps {
  onLaunchSimulator: () => void;
  onExploreTheory: () => void;
  onOpenPresentation: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchSimulator,
  onExploreTheory,
  onOpenPresentation
}) => {
  // Miniature demo animation state:
  // Cycle:
  // Step 0: Input `{`, push `{`
  // Step 1: Input `[`, push `[`
  // Step 2: Input `]`, match & pop `[`
  // Step 3: Input `}`, match & pop `{`
  // Step 4: Finished, empty stack ($ marker), ACCEPT!
  const [miniStep, setMiniStep] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  const miniSequence = [
    { input: '{', action: 'PUSH {', stack: ['$', '{'], log: 'Reading "{" outside string → Push "{" to stack', activeChar: 0 },
    { input: '[', action: 'PUSH [', stack: ['$', '{', '['], log: 'Reading "[" → Push "[" to stack', activeChar: 1 },
    { input: ']', action: 'MATCH POP [', stack: ['$', '{'], log: 'Reading "]" → Top is "[". MATCH! Pop "[".', activeChar: 2 },
    { input: '}', action: 'MATCH POP {', stack: ['$'], log: 'Reading "}" → Top is "{". MATCH! Pop "{".', activeChar: 3 },
    { input: 'EOF', action: 'ACCEPT', stack: ['$'], log: 'End of input reached. Stack is "$" (clean). ACCEPTED!', activeChar: 4 }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setMiniStep((prev) => (prev + 1) % miniSequence.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [isAutoPlay, miniSequence.length]);

  const currentStepData = miniSequence[miniStep];

  return (
    <section className="relative overflow-hidden py-12 lg:py-16 border-b border-cyan-500/10 bg-gradient-to-b from-[#090d1a] via-[#060913] to-[#060913]">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading and Presentation Pitch */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm shadow-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Theory of Computation • FA2 Laboratory Project</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              PDA LAB:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-400">
                Pushdown Automata
              </span>{' '}
              Behind JSON Validation
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Explore how stacks recognize nested structures in modern applications. 
              Experience how a <strong>Deterministic Pushdown Automaton (DPDA)</strong> uses LIFO stack memory 
              to parse arbitrarily deep nesting where Finite State Automata (DFA/NFA) mathematically fail.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onLaunchSimulator}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Launch Simulator
              </button>

              <button
                onClick={onExploreTheory}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm border border-slate-700/60 hover:border-cyan-500/40 transition-all"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Explore PDA Theory
              </button>

              <button
                onClick={onOpenPresentation}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 text-violet-200 hover:text-white font-medium text-sm border border-violet-500/30 hover:border-violet-400/50 transition-all"
              >
                <Layers className="w-4 h-4 text-violet-400" />
                Teacher Demo Mode
              </button>
            </div>

            {/* Quick Formal badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">M</span> = (Q, Σ, Γ, δ, q₀, Z₀, F)
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-violet-400 font-bold">LIFO</span> Stack Memory
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">Chomsky</span> Type-2 Language
              </div>
            </div>
          </div>

          {/* Right Column: Miniature Live Interactive Stack Demo */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-5 rounded-2xl relative border border-cyan-500/20 shadow-2xl shadow-cyan-950/50">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                    Live Miniature Stack Demo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {isAutoPlay ? 'Pause' : 'Auto'}
                  </button>
                  <button
                    onClick={() => setMiniStep((prev) => (prev + 1) % miniSequence.length)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Step
                  </button>
                </div>
              </div>

              {/* Input stream visualization */}
              <div className="mt-4 p-3 rounded-xl bg-[#030611] border border-slate-800/80">
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex justify-between">
                  <span>Input Token Stream</span>
                  <span className="text-cyan-400">Step {miniStep + 1} of 5</span>
                </div>
                <div className="flex items-center justify-center gap-2 font-mono text-base tracking-widest py-1">
                  {['{', '[', ']', '}', 'EOF'].map((token, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded transition-all ${
                        miniStep === idx
                          ? 'bg-cyan-500 text-black font-bold ring-2 ring-cyan-300 shadow-md shadow-cyan-500/40 scale-110'
                          : idx < miniStep
                          ? 'bg-slate-800/80 text-slate-400 line-through'
                          : 'bg-slate-900 text-slate-200'
                      }`}
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stack visualization box */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Visual Stack Chamber */}
                <div className="bg-[#030611] rounded-xl p-3 border border-slate-800 flex flex-col justify-end items-center h-44 relative overflow-hidden">
                  <div className="absolute top-2 left-2 text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3 text-cyan-400" />
                    Stack Chamber (LIFO)
                  </div>

                  {/* Stack items (Bottom at bottom, Top at top) */}
                  <div className="w-full flex flex-col-reverse items-center gap-1.5 z-10">
                    <AnimatePresence>
                      {currentStepData.stack.map((item, idx) => {
                        const isTop = idx === currentStepData.stack.length - 1;
                        const isBottomMarker = item === '$';
                        const isObjectBrace = item === '{';

                        return (
                          <motion.div
                            key={`${item}-${idx}`}
                            initial={{ y: -25, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -25, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className={`w-4/5 py-1.5 px-3 rounded-lg text-center font-mono font-bold text-sm border flex items-center justify-between ${
                              isBottomMarker
                                ? 'bg-slate-900 border-slate-700 text-slate-400'
                                : isObjectBrace
                                ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 shadow-md shadow-cyan-500/20'
                                : 'bg-violet-950/80 border-violet-400/80 text-violet-300 shadow-md shadow-violet-500/20'
                            }`}
                          >
                            <span>{item}</span>
                            <span className="text-[9px] font-mono font-normal opacity-70">
                              {isBottomMarker ? 'Z₀ Marker' : isTop ? '← TOP' : ''}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Live Action Details */}
                <div className="bg-[#030611] rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Current PDA Action
                    </span>
                    <div className="font-mono text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                      {currentStepData.action}
                    </div>
                    <div className="mt-2 text-xs text-slate-300 leading-snug">
                      {currentStepData.log}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Stack Depth:</span>
                    <span className="text-cyan-400 font-bold">{currentStepData.stack.length - 1} delimiters</span>
                  </div>
                </div>
              </div>

              {/* Bottom status */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Deterministic transition
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  State: <strong className="text-cyan-300">{miniStep === 4 ? 'q_accept' : 'q1'}</strong>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
