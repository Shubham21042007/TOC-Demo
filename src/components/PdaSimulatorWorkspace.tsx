import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXAMPLE_CASES } from '../data/examples';
import type { ExampleCase, SimulationResult, TransitionStep } from '../types/pda';
import { runPdaSimulation } from '../utils/pdaSimulator';
import { CodeEditor } from './CodeEditor';
import { StackVisualizer } from './StackVisualizer';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionTable } from './ExecutionTable';
import { StateMachineDiagram } from './StateMachineDiagram';
import { ResultBanner } from './ResultBanner';
import { HowItWorks } from './HowItWorks';

interface PdaSimulatorWorkspaceProps {
  onStageChange?: (stage: 'setup' | 'simulating' | 'completed', stepIndex: number, totalSteps: number, isAccepted: boolean) => void;
}

export const PdaSimulatorWorkspace: React.FC<PdaSimulatorWorkspaceProps> = ({
  onStageChange
}) => {
  // Input JSON string (starts with default clean example)
  const [jsonInput, setJsonInput] = useState<string>(EXAMPLE_CASES[0].json);
  const [selectedExampleId, setSelectedExampleId] = useState<string>(EXAMPLE_CASES[0].id);

  // 5-Stage Lifecycle State:
  // 'setup' (Stage 1) -> 'simulating' (Stage 2) -> 'completed' (Stages 3, 4, 5)
  const [stage, setStage] = useState<'setup' | 'simulating' | 'completed'>('setup');
  const [isOutdated, setIsOutdated] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(450); // ms per step (100 - 1500)

  // Simulation result calculated from active input
  const simulationResult: SimulationResult = useMemo(() => {
    return runPdaSimulation(jsonInput);
  }, [jsonInput]);

  const totalSteps = simulationResult.steps.length;
  const currentStep: TransitionStep | undefined = stage !== 'setup'
    ? simulationResult.steps[currentStepIndex]
    : undefined;

  const isFinished = stage === 'completed' || (stage === 'simulating' && currentStepIndex >= totalSteps - 1);
  const isAccepted = isFinished && simulationResult.isAccepted;
  const isRejected = isFinished && !simulationResult.isAccepted;

  // Notify parent of stage changes for header status
  useEffect(() => {
    if (onStageChange) {
      onStageChange(stage, currentStepIndex, totalSteps, simulationResult.isAccepted);
    }
  }, [stage, currentStepIndex, totalSteps, simulationResult.isAccepted, onStageChange]);

  // Immediate speed response timer ref
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!isPlaying || stage !== 'simulating') return;

    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      setStage('completed');
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSteps - 1) {
          setIsPlaying(false);
          setStage('completed');
          return totalSteps - 1;
        }
        return next;
      });
    }, speedRef.current);

    return () => clearTimeout(timer);
  }, [isPlaying, stage, currentStepIndex, totalSteps, speed]);

  // Trigger celebration confetti on accept once completed
  useEffect(() => {
    if (stage === 'completed' && isAccepted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [stage, isAccepted]);

  // Stage 1: User edits text
  const handleInputChange = (newVal: string) => {
    setIsPlaying(false);
    setSelectedExampleId('');
    setJsonInput(newVal);
    // Any change returns to Stage 1 and marks previous result as outdated
    setStage('setup');
    setIsOutdated(true);
    setCurrentStepIndex(0);
  };

  // Stage 1: User selects an example preset (Populates without auto-running)
  const handleSelectExample = (example: ExampleCase) => {
    setIsPlaying(false);
    setSelectedExampleId(example.id);
    setJsonInput(example.json);
    setStage('setup');
    setIsOutdated(false);
    setCurrentStepIndex(0);
  };

  // User clicks "Run Simulation" -> transitions to Stage 2 (Simulating)
  const handleRunSimulation = () => {
    setIsOutdated(false);
    setCurrentStepIndex(0);
    setStage('simulating');
    setIsPlaying(true);
  };

  // Step Forward: executes exactly one step
  const handleStepForward = () => {
    if (stage === 'setup') {
      setStage('simulating');
      setIsOutdated(false);
      setCurrentStepIndex(0);
      return;
    }
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      if (next >= totalSteps - 1) {
        setStage('completed');
      }
    } else {
      setStage('completed');
    }
  };

  // Step Backward: restores exact preceding state and stack
  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (stage === 'setup') {
      handleRunSimulation();
      return;
    }
    if (stage === 'completed') {
      // Re-run simulation
      handleRunSimulation();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Reset simulation to step 0 and initial stack ['$']
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setStage('setup');
  };

  // Clear input
  const handleClear = () => {
    setIsPlaying(false);
    setSelectedExampleId('');
    setJsonInput('');
    setStage('setup');
    setIsOutdated(false);
    setCurrentStepIndex(0);
  };

  // Jump to specific step by clicking execution table row
  const handleSelectStep = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
    if (index >= totalSteps - 1) {
      setStage('completed');
    }
  };

  // Stack display: if in setup, show initial ['$']
  const stackForCurrentStep = currentStep ? currentStep.stackAfter : ['$'];

  return (
    <main className="py-5 sm:py-6 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* STAGES 1 & 2: PRIMARY TWO-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: JSON Input & Controls (Span 7) */}
          <div className="lg:col-span-7 space-y-3.5">
            
            {/* JSON Code Editor */}
            <CodeEditor
              value={jsonInput}
              onChange={handleInputChange}
              currentStep={currentStep}
              isSimulating={stage === 'simulating' || stage === 'completed'}
            />

            {/* Playback Controls & Speed Slider */}
            <ExecutionControls
              onRunSimulation={handleRunSimulation}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onClear={handleClear}
              onSelectExample={handleSelectExample}
              isPlaying={isPlaying}
              speed={speed}
              onSpeedChange={setSpeed}
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              isFinished={stage === 'completed'}
              hasRun={stage !== 'setup'}
              isOutdated={isOutdated}
              selectedExampleId={selectedExampleId}
            />

          </div>

          {/* RIGHT PANEL: Live PDA Stack & Current Action (Span 5) */}
          <div className="lg:col-span-5 space-y-3.5">
            
            {/* Live State & Operation Summary Card */}
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Current Transition:</span>
                <span className="text-cyan-300 font-bold truncate max-w-[240px]">
                  {currentStep ? currentStep.transitionRule : "Initial Start: δ(q0, ε, Z₀)"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-xl bg-[#030611] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Input Token</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {currentStep ? currentStep.displayChar : '-'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#030611] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">PDA State</span>
                  <span className={`text-sm font-bold ${
                    currentStep?.stateAfter === 'q_accept' ? 'text-emerald-400' :
                    currentStep?.stateAfter === 'q_reject' ? 'text-rose-400' :
                    'text-cyan-300'
                  }`}>
                    {currentStep ? currentStep.stateAfter : 'q0'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#030611] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Action</span>
                  <span className="text-xs font-bold text-sky-400 truncate block mt-0.5">
                    {currentStep ? currentStep.action : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Dynamic Action Explanation Callout */}
              <div className="p-2.5 rounded-xl bg-[#030611] border border-cyan-500/20 text-xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {stage === 'setup'
                    ? 'Ready for Simulation'
                    : `Step ${currentStepIndex} of ${totalSteps - 1}`}
                </div>
                <p className="text-slate-200 leading-snug">
                  {currentStep
                    ? currentStep.explanation
                    : 'Click "Run Simulation" to sequentially process the input character by character.'}
                </p>
              </div>
            </div>

            {/* Vertical Stack Visualizer */}
            <StackVisualizer
              currentStep={currentStep}
              stack={stackForCurrentStep}
              isAccepted={stage === 'completed' && isAccepted}
              isRejected={stage === 'completed' && isRejected}
            />

          </div>

        </div>

        {/* STAGE 3: COMPACT FINAL RESULT BANNER (Smoothly reveals only after simulation finishes) */}
        {stage === 'completed' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <ResultBanner
              result={simulationResult}
              totalSteps={totalSteps}
            />
          </div>
        )}

        {/* STAGE 4: DYNAMIC STATE DIAGRAM (Smoothly reveals underneath after simulation finishes) */}
        {stage === 'completed' && (
          <div className="animate-in fade-in slide-in-from-top-6 duration-700">
            <StateMachineDiagram
              currentState={simulationResult.finalState}
              currentStep={simulationResult.steps[simulationResult.steps.length - 1]}
              result={simulationResult}
              onReplay={() => {
                handleRunSimulation();
              }}
              hasRun={true}
            />
          </div>
        )}

        {/* STAGE 5: OPTIONAL TECHNICAL DETAILS (Collapsed by default below diagram) */}
        {stage === 'completed' && (
          <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-in fade-in duration-700">
            {/* 5A. Compact Execution Log (Collapsed by default) */}
            <ExecutionTable
              steps={simulationResult.steps}
              currentStepIndex={currentStepIndex}
              onSelectStep={handleSelectStep}
              hasRun={true}
            />

            {/* 5B. How It Works (Collapsed by default) */}
            <HowItWorks />
          </div>
        )}

      </div>
    </main>
  );
};
