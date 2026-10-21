import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PdaSimulatorWorkspace } from './components/PdaSimulatorWorkspace';

export function App() {
  const [currentStage, setCurrentStage] = useState<'setup' | 'simulating' | 'completed'>('setup');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);

  const handleStageChange = (
    stage: 'setup' | 'simulating' | 'completed',
    stepIndex: number,
    stepsTotal: number,
    accepted: boolean
  ) => {
    setCurrentStage(stage);
    setCurrentStepIndex(stepIndex);
    setTotalSteps(stepsTotal);
    setIsAccepted(accepted);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Presentation-First Header with Live Stage Indicator */}
      <Navbar
        currentStage={currentStage}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isAccepted={isAccepted}
      />

      {/* Unified 5-Stage Interactive PDA Presentation Workspace */}
      <div className="flex-1">
        <PdaSimulatorWorkspace onStageChange={handleStageChange} />
      </div>

      {/* Compact Classroom Presentation Footer */}
      <footer className="border-t border-slate-800/80 py-3 text-center text-xs text-slate-500 bg-[#040711]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-400">
            <strong>PDA LAB</strong> — Pushdown Automata Behind JSON Validation
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Theory of Computation (TOC) • FA2 Presentation
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
