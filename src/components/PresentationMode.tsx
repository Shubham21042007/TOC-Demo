import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Sparkles,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXAMPLE_CASES } from '../data/examples';
import { runPdaSimulation } from '../utils/pdaSimulator';
import type { SimulationResult, TransitionStep } from '../types/pda';

interface PresentationModeProps {
  onClose: () => void;
  initialJson?: string;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ onClose, initialJson }) => {
  // Quick presets for teacher/classroom demo
  const [jsonText, setJsonText] = useState<string>(initialJson || EXAMPLE_CASES[0].json);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(500);

  // Simulation execution state
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const result: SimulationResult = React.useMemo(() => {
    return runPdaSimulation(jsonText);
  }, [jsonText]);

  const totalSteps = result.steps.length;
  const currentStep: TransitionStep | undefined = result.steps[stepIndex];
  const isFinished = stepIndex >= totalSteps - 1;
  const isAccepted = isFinished && result.isAccepted;
  const isRejected = isFinished && !result.isAccepted;

  // Immediate speed response timer
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!isPlaying) return;
    if (isFinished) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSteps - 1) {
          setIsPlaying(false);
          return totalSteps - 1;
        }
        return next;
      });
    }, speedRef.current);

    return () => clearTimeout(timer);
  }, [isPlaying, isFinished, stepIndex, totalSteps, speed]);

  // Confetti on accept
  useEffect(() => {
    if (isAccepted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isAccepted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setStepIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSteps, onClose]);

  const handleSelectPreset = (idx: number) => {
    setIsPlaying(false);
    setActivePresetIndex(idx);
    setJsonText(EXAMPLE_CASES[idx].json);
    setStepIndex(0);
  };

  const currentStack = currentStep ? currentStep.stackAfter : ['$'];
  const stackTopToBottom = [...currentStack].reverse();

  return (
    <div className="fixed inset-0 z-50 bg-[#040711] text-slate-100 flex flex-col overflow-y-auto selection:bg-cyan-500/30">
      
      {/* Top Presentation Bar */}
      <div className="px-6 py-3.5 bg-[#070b16] border-b border-cyan-500/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-bold">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wider text-cyan-300">
                PDA LAB — Classroom Presentation Mode
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/60">
                Live Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Projector-Optimized UI • Dynamic LIFO Stack Execution
            </p>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#030611] p-1.5 rounded-xl border border-slate-800">
          {EXAMPLE_CASES.slice(0, 4).map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activePresetIndex === idx
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {ex.name.split('. ')[1] || ex.name}
            </button>
          ))}
        </div>

        {/* Exit Presentation Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-200 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-rose-500/40 transition-all shadow-md"
        >
          <X className="w-4 h-4" />
          <span>Exit Presentation</span>
          <kbd className="ml-1 text-[10px] bg-slate-900 px-1 rounded text-slate-400 font-mono">
            ESC
          </kbd>
        </button>
      </div>

      {/* Main Presentation Viewport */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col justify-between gap-5">
        
        {/* Large Narration Subtitle Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0 border border-cyan-500/40 text-sm">
              {stepIndex}
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                Operation Narration:
              </span>
              <p className="text-base sm:text-lg font-medium text-white leading-snug">
                {currentStep?.explanation || 'Ready. Click Play or Next Step to demonstrate.'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>State:</span>
            <span className={`px-2 py-1 rounded font-bold ${
              currentStep?.stateAfter === 'q_accept' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
              currentStep?.stateAfter === 'q_reject' ? 'bg-rose-950 text-rose-400 border border-rose-500/40' :
              'bg-black/60 text-cyan-300 border border-cyan-500/30'
            }`}>
              {currentStep?.stateAfter || 'q0'}
            </span>
          </div>
        </div>

        {/* 2-Column Split: Maximized Code Stream vs Big Stack Chamber */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[320px]">
          
          {/* Left: Code Stream with Active Character Spotlight */}
          <div className="lg:col-span-7 rounded-2xl bg-[#030611] p-5 border border-cyan-500/20 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="text-cyan-300 font-bold uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  JSON Input Stream (Sequential Tokenizer)
                </span>
                <span>
                  Char: <strong className="text-cyan-300 font-bold text-sm">{currentStep?.displayChar ?? '-'}</strong>
                </span>
              </div>

              {/* Code display with character highlight */}
              <div className="font-mono text-sm sm:text-base leading-7 bg-[#050914] p-4 rounded-xl border border-slate-800/80 max-h-[260px] overflow-y-auto whitespace-pre font-medium text-slate-300">
                {jsonText.split('').map((char, idx) => {
                  const isCurrent = currentStep && currentStep.charIndex === idx;
                  const isPast = currentStep && currentStep.charIndex > idx;
                  return (
                    <span
                      key={idx}
                      className={`${
                        isCurrent
                          ? 'bg-cyan-400 text-black font-extrabold ring-4 ring-cyan-400/50 rounded px-0.5'
                          : isPast
                          ? 'text-slate-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Transition Rule Display */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Formal Transition:</span>
              <span className="text-cyan-300 font-bold">
                {currentStep?.transitionRule || 'Initial δ(q0, ε, Z₀)'}
              </span>
            </div>
          </div>

          {/* Right: Big Stack Chamber */}
          <div className="lg:col-span-5 rounded-2xl bg-[#030611] p-5 border border-cyan-500/20 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="text-cyan-300 font-bold uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  LIFO Stack Chamber
                </span>
                <span className="text-cyan-400 font-bold">
                  Depth: {Math.max(0, currentStack.length - 1)}
                </span>
              </div>

              {/* Stack Chamber */}
              <div className="bg-[#02040b] rounded-xl p-3 border border-slate-800/90 h-[220px] flex flex-col justify-end items-center overflow-hidden">
                <div className="w-full max-w-[260px] flex flex-col-reverse items-center gap-1.5">
                  {currentStack.map((sym, idx) => {
                    const isTop = idx === currentStack.length - 1;
                    const isBottom = sym === '$';
                    const isObj = sym === '{';

                    return (
                      <div
                        key={idx}
                        className={`w-full py-1.5 px-4 rounded-xl border flex items-center justify-between font-mono text-base font-bold shadow-lg transition-all ${
                          isBottom
                            ? 'bg-slate-900 border-slate-700 text-slate-400'
                            : isObj
                            ? 'bg-blue-950 border-blue-400 text-blue-200'
                            : 'bg-violet-950 border-violet-400 text-violet-200'
                        }`}
                      >
                        <span className="text-xl">{sym}</span>
                        <span className="text-[10px] font-sans font-normal opacity-80">
                          {isBottom ? 'Z₀ Marker ($)' : isTop ? '← TOP (LIFO)' : 'Nested Scope'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stack Top Summary */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Stack (Top → Bottom):</span>
              <span className="text-cyan-300 font-bold">
                [{stackTopToBottom.join(', ')}]
              </span>
            </div>
          </div>

        </div>

        {/* Final Decision Banner (if reached end of demo) */}
        {isAccepted && (
          <div className="p-3.5 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between shadow-2xl shadow-emerald-950">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  ACCEPTED BY PUSHDOWN AUTOMATON & JSON SPECIFICATION!
                </h4>
                <p className="text-xs text-emerald-300">
                  All scopes closed in strict LIFO order. Stack cleanly emptied to $. Full JSON grammar verified.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-emerald-900 border border-emerald-500 text-emerald-200">
              q_accept
            </span>
          </div>
        )}

        {isRejected && (
          <div className="p-3.5 rounded-2xl bg-rose-950 border-2 border-rose-500 text-rose-200 flex items-center justify-between shadow-2xl shadow-rose-950">
            <div className="flex items-center gap-3">
              <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  REJECTED: SYNTAX / DELIMITER ERROR ENCOUNTERED!
                </h4>
                <p className="text-xs text-rose-300">
                  {result.errorMessage || 'Structural mismatch or illegal trailing syntax detected.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-rose-900 border border-rose-500 text-rose-200">
              q_reject
            </span>
          </div>
        )}

        {/* Bottom Presentation Controls Bar (Big Buttons + Prominent Speed Slider) */}
        <div className="p-3.5 rounded-2xl bg-[#060b18] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
          
          {/* Step Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/25'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play'}</span>
            </button>

            <button
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={stepIndex <= 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
              <span>Prev Step</span>
            </button>

            <button
              onClick={() => setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1))}
              disabled={isFinished}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 disabled:opacity-40 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-colors"
            >
              <span>Next Step</span>
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setStepIndex(0);
                setIsPlaying(false);
              }}
              title="Reset"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Prominent Speed Slider in Presentation Mode */}
          <div className="flex items-center gap-2 bg-[#030611] px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <Gauge className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-400">Speed:</span>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-24 sm:w-32 accent-cyan-400 cursor-pointer"
            />
            <span className="text-[11px] font-mono font-bold text-cyan-300 min-w-[50px] text-right">
              {speed} ms
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Step {stepIndex} of {Math.max(0, totalSteps - 1)}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
