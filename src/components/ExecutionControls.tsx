import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Trash2, 
  Gauge, 
  RefreshCw,
  Info
} from 'lucide-react';
import { EXAMPLE_CASES } from '../data/examples';
import type { ExampleCase } from '../types/pda';

interface ExecutionControlsProps {
  onRunSimulation: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onClear: () => void;
  onSelectExample: (example: ExampleCase) => void;
  isPlaying: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  isFinished: boolean;
  hasRun: boolean;
  isOutdated: boolean;
  selectedExampleId?: string;
}

export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  onRunSimulation,
  onStepForward,
  onStepBackward,
  onTogglePlay,
  onReset,
  onClear,
  onSelectExample,
  isPlaying,
  speed,
  onSpeedChange,
  currentStepIndex,
  totalSteps,
  isFinished,
  hasRun,
  isOutdated,
  selectedExampleId
}) => {
  return (
    <div className="space-y-3">
      {/* Stage 1 Instruction & Example Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#060b18] border border-cyan-500/20">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {!hasRun 
              ? 'Enter JSON and run the PDA simulation.' 
              : isOutdated
              ? 'Input modified. Click Run Simulation to re-process.'
              : isFinished
              ? 'Simulation complete! Review result & state diagram below.'
              : 'Simulation running... Follow stack transitions.'}
          </span>
        </div>

        {/* Small Example Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-mono mr-1 hidden lg:inline">
            Examples:
          </span>
          {EXAMPLE_CASES.slice(0, 5).map((ex) => {
            const isSelected = selectedExampleId === ex.id;
            const isAccept = ex.expectedResult === 'ACCEPT';
            return (
              <button
                key={ex.id}
                onClick={() => onSelectExample(ex)}
                title={ex.description}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-all border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-bold shadow-sm shadow-cyan-950'
                    : 'bg-[#030611] hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                <span>{ex.name.split('. ')[1] || ex.name}</span>
                <span className={`ml-1 text-[9px] font-bold ${
                  isAccept ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isAccept ? '✓' : '✗'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Playback & Speed Controls Toolbar */}
      <div className="p-3 rounded-xl bg-[#060b18] border border-cyan-500/20 shadow-md flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Primary Run & Step Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Prominent Run Simulation Button */}
          <button
            onClick={onRunSimulation}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-md ${
              !hasRun || isOutdated
                ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30 ring-2 ring-cyan-400/50 animate-pulse'
                : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{!hasRun ? 'Run Simulation' : isOutdated ? 'Re-Run Simulation' : 'Run Again'}</span>
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            disabled={!hasRun}
            title={isPlaying ? 'Pause animation' : 'Play / Resume animation'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStepIndex > 0 && !isFinished ? 'Resume' : 'Play'}</span>
              </>
            )}
          </button>

          {/* Previous Step */}
          <button
            onClick={onStepBackward}
            disabled={!hasRun || currentStepIndex <= 0 || isPlaying}
            title="Step backward one recorded transition"
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Next Step */}
          <button
            onClick={onStepForward}
            disabled={!hasRun || isFinished || isPlaying}
            title="Step forward one recorded transition"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-medium transition-colors"
          >
            <span>Next</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            disabled={!hasRun}
            title="Reset stack to initial state ($) and step 0"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Clear Input */}
          <button
            onClick={onClear}
            title="Clear code editor"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 border border-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Prominent Speed Slider & Step Counter */}
        <div className="flex items-center gap-3">
          {hasRun && (
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Step <strong className="text-cyan-300">{currentStepIndex}</strong> / {Math.max(0, totalSteps - 1)}
            </span>
          )}

          <div className="flex items-center gap-2.5 bg-[#030611] px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Gauge className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-400">Speed:</span>
            
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-24 sm:w-28 accent-cyan-400 cursor-pointer"
              title={`Animation speed: ${speed}ms per step`}
            />

            <span className="text-[11px] font-mono font-bold text-cyan-300 min-w-[48px] text-right">
              {speed} ms
            </span>
          </div>
        </div>

      </div>

      {/* Input Outdated Notice */}
      {isOutdated && hasRun && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            Input text was edited. Previous simulation results are outdated.
          </span>
          <button
            onClick={onRunSimulation}
            className="text-[11px] underline font-bold hover:text-amber-200"
          >
            Run Now
          </button>
        </div>
      )}
    </div>
  );
};
