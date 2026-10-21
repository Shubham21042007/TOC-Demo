import React, { useState, useEffect } from 'react';
import { Layers, Maximize2, Minimize2, Sparkles, CheckCircle2, XCircle, Play } from 'lucide-react';

interface NavbarProps {
  currentStage: 'setup' | 'simulating' | 'completed';
  currentStepIndex: number;
  totalSteps: number;
  isAccepted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  currentStepIndex,
  totalSteps,
  isAccepted,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#070b16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand & TOC FA2 Badge */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Layers className="w-4 h-4 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070b16]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400">
                PDA LAB
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
                TOC FA2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Pushdown Automata Behind JSON Validation
            </p>
          </div>
        </div>

        {/* Live Presentation Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#030611] border border-slate-800 text-xs font-mono">
          <span className="text-[10px] uppercase text-slate-400">Status:</span>

          {currentStage === 'setup' && (
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Stage 1: Enter JSON & Run
            </span>
          )}

          {currentStage === 'simulating' && (
            <span className="flex items-center gap-1.5 text-sky-300 font-bold animate-pulse">
              <Play className="w-3.5 h-3.5 fill-current" />
              Stage 2: Live Processing (Step {currentStepIndex}/{Math.max(0, totalSteps - 1)})
            </span>
          )}

          {currentStage === 'completed' && (
            <span className={`flex items-center gap-1.5 font-bold ${
              isAccepted ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {isAccepted ? 'Stages 3 & 4: Accepted (Diagram Ready)' : 'Stages 3 & 4: Rejected (Error Diagnosed)'}
            </span>
          )}
        </div>

        {/* Projector / Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Projector Mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors shadow-sm"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Projector View'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
