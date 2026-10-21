import { useState } from 'react';
import { GitGraph, RotateCcw, ArrowRight } from 'lucide-react';
import type { PdaState, SimulationResult, TransitionStep } from '../types/pda';

interface StateMachineDiagramProps {
  currentState: PdaState;
  currentStep?: TransitionStep;
  result?: SimulationResult;
  onReplay?: () => void;
  hasRun?: boolean;
}

export const StateMachineDiagram: React.FC<StateMachineDiagramProps> = ({
  currentState,
  currentStep,
  result,
  onReplay,
  hasRun = false,
}) => {
  const [showTransitionTable, setShowTransitionTable] = useState<boolean>(false);

  // Active step info
  const action = currentStep?.action;
  const isStartTrans = currentStep?.step === 0 || (currentStep?.step === 1 && currentStep?.stateBefore === 'q0');
  const isPushActive = action === 'PUSH';
  const isPopActive = action === 'MATCH_POP';
  const isReadActive = action === 'READ' || action === 'IGNORE_STRING';
  const isToAccept = currentState === 'q_accept';
  const isToReject = currentState === 'q_reject';

  // Compute metrics from actual simulation result
  const stats = result?.stats || { pushCount: 0, popCount: 0, readCount: 0, stringCharCount: 0, maxStackDepth: 0 };
  const isAccepted = result?.isAccepted ?? false;
  const isFinished = currentState === 'q_accept' || currentState === 'q_reject';

  // Build aggregated dynamic transition summary
  const dynamicTransitions = [
    {
      id: 'init',
      from: 'q0',
      to: 'q1',
      label: 'Initial / Push $ (Z₀)',
      count: hasRun ? 1 : 0,
      active: isStartTrans,
      status: 'executed',
    },
    {
      id: 'push',
      from: 'q1',
      to: 'q1',
      label: "Push '{' or '[' onto stack",
      count: stats.pushCount,
      active: isPushActive,
      status: stats.pushCount > 0 ? 'executed' : 'unused',
    },
    {
      id: 'pop',
      from: 'q1',
      to: 'q1',
      label: "Match & Pop '}' or ']'",
      count: stats.popCount,
      active: isPopActive,
      status: stats.popCount > 0 ? 'executed' : 'unused',
    },
    {
      id: 'read',
      from: 'q1',
      to: 'q1',
      label: 'Literals, separators, whitespace, strings (Preserve stack)',
      count: stats.readCount + stats.stringCharCount,
      active: isReadActive,
      status: stats.readCount + stats.stringCharCount > 0 ? 'executed' : 'unused',
    },
    {
      id: 'accept',
      from: 'q1',
      to: 'q_accept',
      label: 'EOF, stack=$ & syntax valid → ACCEPT',
      count: isAccepted ? 1 : 0,
      active: isToAccept,
      status: isAccepted ? 'executed' : 'unused',
    },
    {
      id: 'reject',
      from: 'q1',
      to: 'q_reject',
      label: result?.errorMessage || 'Mismatch / Unclosed / Syntax Fail → REJECT',
      count: !isAccepted && hasRun ? 1 : 0,
      active: isToReject,
      status: !isAccepted && hasRun ? 'executed' : 'unused',
    },
  ];

  return (
    <div id="state-diagram" className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <GitGraph className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Dynamic PDA State Machine Diagram
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                Generated from Input
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {hasRun
                ? `Actual computation: ${result?.steps.length || 0} transitions processed for current JSON input`
                : 'Click "Run Simulation" to generate dynamic transitions from your JSON'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onReplay && hasRun && (
            <button
              onClick={onReplay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Replay Diagram</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Active State:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${
              currentState === 'q_accept' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' :
              currentState === 'q_reject' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' :
              currentState === 'q0' ? 'bg-slate-800 text-slate-300' :
              'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
            }`}>
              {currentState}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for State Machine */}
      <div className="relative bg-[#02050f] rounded-xl p-4 border border-slate-800/90 flex flex-col items-center justify-center overflow-x-auto min-h-[280px]">
        
        <svg
          viewBox="0 0 880 320"
          className="w-full max-w-[840px] h-auto select-none"
        >
          <defs>
            {/* Standard Cyan Arrow */}
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>

            {/* Glowing Green Arrow */}
            <marker
              id="arrow-green"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>

            {/* Glowing Red Arrow */}
            <marker
              id="arrow-red"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>

            {/* Dimmed Default Arrow */}
            <marker
              id="arrow-dim"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
          </defs>

          {/* Start arrow into q0 */}
          <line
            x1="30"
            y1="160"
            x2="85"
            y2="160"
            stroke={isStartTrans ? '#38bdf8' : '#475569'}
            strokeWidth={isStartTrans ? '3' : '2'}
            markerEnd={isStartTrans ? 'url(#arrow-cyan)' : 'url(#arrow-dim)'}
          />
          <text x="35" y="145" fill="#94a3b8" fontSize="11" fontFamily="Fira Code, monospace">
            start
          </text>

          {/* State q0: Start */}
          <g transform="translate(130, 160)">
            <circle
              r="40"
              fill={currentState === 'q0' ? '#0e2343' : '#080d1e'}
              stroke={currentState === 'q0' ? '#38bdf8' : '#334155'}
              strokeWidth={currentState === 'q0' ? '3.5' : '2'}
              filter={currentState === 'q0' ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.6))' : 'none'}
            />
            <text
              textAnchor="middle"
              dy="5"
              fill={currentState === 'q0' ? '#38bdf8' : '#94a3b8'}
              fontSize="16"
              fontWeight="bold"
              fontFamily="Fira Code, monospace"
            >
              q0
            </text>
            <text textAnchor="middle" dy="22" fill="#64748b" fontSize="10" fontFamily="sans-serif">
              Start
            </text>
          </g>

          {/* Transition q0 -> q1 */}
          <path
            d="M 172 160 L 330 160"
            fill="none"
            stroke={isStartTrans || hasRun ? '#38bdf8' : '#475569'}
            strokeWidth={isStartTrans ? '3.5' : '2'}
            markerEnd={isStartTrans || hasRun ? 'url(#arrow-cyan)' : 'url(#arrow-dim)'}
          />
          <g transform="translate(250, 142)">
            <rect x="-45" y="-12" width="90" height="20" rx="4" fill="#030611" stroke="#1e293b" />
            <text textAnchor="middle" dy="2" fill="#38bdf8" fontSize="10" fontFamily="Fira Code, monospace">
              ε, ε → $
            </text>
          </g>

          {/* State q1: Read and Process */}
          <g transform="translate(380, 160)">
            <circle
              r="46"
              fill={currentState === 'q1' ? '#0d2248' : '#080d1e'}
              stroke={currentState === 'q1' ? '#38bdf8' : '#334155'}
              strokeWidth={currentState === 'q1' ? '3.5' : '2'}
              filter={currentState === 'q1' ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.7))' : 'none'}
            />
            <text
              textAnchor="middle"
              dy="5"
              fill={currentState === 'q1' ? '#38bdf8' : '#94a3b8'}
              fontSize="18"
              fontWeight="bold"
              fontFamily="Fira Code, monospace"
            >
              q1
            </text>
            <text textAnchor="middle" dy="24" fill="#64748b" fontSize="10" fontFamily="sans-serif">
              Processing
            </text>
          </g>

          {/* Self-Loop on q1: Pushing, Popping, Reading */}
          <path
            d="M 360 114 C 310 15, 450 15, 400 114"
            fill="none"
            stroke={isPushActive || isPopActive || isReadActive ? '#38bdf8' : hasRun ? '#0284c7' : '#334155'}
            strokeWidth={isPushActive || isPopActive || isReadActive ? '3.5' : '2'}
            markerEnd={isPushActive || isPopActive || isReadActive || hasRun ? 'url(#arrow-cyan)' : 'url(#arrow-dim)'}
          />
          
          {/* Dynamic Aggregated Self-Loop Box */}
          <g transform="translate(380, 48)">
            <rect
              x="-140"
              y="-32"
              width="280"
              height="56"
              rx="8"
              fill="#030611"
              stroke={isPushActive || isPopActive || isReadActive ? '#38bdf8' : '#1e293b'}
              strokeWidth={isPushActive || isPopActive || isReadActive ? '1.5' : '1'}
            />
            <text textAnchor="middle" y="-14" fill="#38bdf8" fontSize="10" fontFamily="Fira Code, monospace">
              Push {'{'} or [ : <tspan fontWeight="bold" fill="#7dd3fc">{stats.pushCount}×</tspan>
            </text>
            <text textAnchor="middle" y="2" fill="#34d399" fontSize="10" fontFamily="Fira Code, monospace">
              Pop {'}'} or ] : <tspan fontWeight="bold" fill="#6ee7b7">{stats.popCount}×</tspan>
            </text>
            <text textAnchor="middle" y="16" fill="#94a3b8" fontSize="9" fontFamily="Fira Code, monospace">
              Literals & strings : <tspan fill="#cbd5e1">{stats.readCount + stats.stringCharCount}×</tspan>
            </text>
          </g>

          {/* Transition q1 -> q_accept */}
          <path
            d="M 425 145 C 510 100, 610 100, 690 135"
            fill="none"
            stroke={isToAccept || (isFinished && isAccepted) ? '#10b981' : '#334155'}
            strokeWidth={isToAccept || (isFinished && isAccepted) ? '3.5' : '2'}
            markerEnd={isToAccept || (isFinished && isAccepted) ? 'url(#arrow-green)' : 'url(#arrow-dim)'}
          />
          <g transform="translate(560, 95)">
            <rect x="-85" y="-12" width="170" height="20" rx="4" fill="#030611" stroke={isAccepted ? '#059669' : '#1e293b'} />
            <text textAnchor="middle" dy="2" fill={isAccepted ? '#34d399' : '#64748b'} fontSize="10" fontFamily="Fira Code, monospace">
              EOF, $ → $ [Syntax Valid]
            </text>
          </g>

          {/* State q_accept (Accepting double ring) */}
          <g transform="translate(740, 145)">
            <circle
              r="44"
              fill={currentState === 'q_accept' || (isFinished && isAccepted) ? '#06301d' : '#080d1e'}
              stroke={currentState === 'q_accept' || (isFinished && isAccepted) ? '#10b981' : '#334155'}
              strokeWidth="2.5"
              filter={currentState === 'q_accept' || (isFinished && isAccepted) ? 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.7))' : 'none'}
            />
            <circle
              r="37"
              fill="none"
              stroke={currentState === 'q_accept' || (isFinished && isAccepted) ? '#34d399' : '#334155'}
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              dy="5"
              fill={currentState === 'q_accept' || (isFinished && isAccepted) ? '#34d399' : '#94a3b8'}
              fontSize="14"
              fontWeight="bold"
              fontFamily="Fira Code, monospace"
            >
              q_accept
            </text>
            <text textAnchor="middle" dy="22" fill="#10b981" fontSize="9" fontFamily="sans-serif">
              ACCEPTED
            </text>
          </g>

          {/* Transition q1 -> q_reject */}
          <path
            d="M 420 185 C 500 230, 610 235, 690 210"
            fill="none"
            stroke={isToReject || (isFinished && !isAccepted && hasRun) ? '#f43f5e' : '#334155'}
            strokeWidth={isToReject || (isFinished && !isAccepted && hasRun) ? '3.5' : '2'}
            markerEnd={isToReject || (isFinished && !isAccepted && hasRun) ? 'url(#arrow-red)' : 'url(#arrow-dim)'}
          />
          <g transform="translate(560, 240)">
            <rect x="-95" y="-12" width="190" height="20" rx="4" fill="#030611" stroke={!isAccepted && hasRun ? '#e11d48' : '#1e293b'} />
            <text textAnchor="middle" dy="2" fill={!isAccepted && hasRun ? '#fb7185' : '#64748b'} fontSize="10" fontFamily="Fira Code, monospace">
              Mismatch / Unclosed / Syntax Fail
            </text>
          </g>

          {/* State q_reject */}
          <g transform="translate(740, 240)">
            <circle
              r="38"
              fill={currentState === 'q_reject' || (isFinished && !isAccepted && hasRun) ? '#350a16' : '#080d1e'}
              stroke={currentState === 'q_reject' || (isFinished && !isAccepted && hasRun) ? '#f43f5e' : '#334155'}
              strokeWidth={currentState === 'q_reject' || (isFinished && !isAccepted && hasRun) ? '3' : '2'}
              filter={currentState === 'q_reject' || (isFinished && !isAccepted && hasRun) ? 'drop-shadow(0 0 16px rgba(244, 63, 94, 0.7))' : 'none'}
            />
            <text
              textAnchor="middle"
              dy="5"
              fill={currentState === 'q_reject' || (isFinished && !isAccepted && hasRun) ? '#f43f5e' : '#94a3b8'}
              fontSize="14"
              fontWeight="bold"
              fontFamily="Fira Code, monospace"
            >
              q_reject
            </text>
            <text textAnchor="middle" dy="20" fill="#f43f5e" fontSize="9" fontFamily="sans-serif">
              REJECTED
            </text>
          </g>
        </svg>

      </div>

      {/* Dynamic Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-[#030611] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Recorded Path:</span>
          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span>q0</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span>q1 ({result?.steps.length ? result.steps.length - 1 : 0} ops)</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className={isAccepted ? 'text-emerald-400' : hasRun ? 'text-rose-400' : 'text-slate-500'}>
              {isAccepted ? 'q_accept' : hasRun ? 'q_reject' : 'pending'}
            </span>
          </span>
        </div>

        <button
          onClick={() => setShowTransitionTable(!showTransitionTable)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-sans"
        >
          {showTransitionTable ? 'Hide Transition Table' : 'Show Invoked Transition Table'}
        </button>
      </div>

      {/* Invoked Transition Table (Collapsible) */}
      {showTransitionTable && (
        <div className="pt-2 border-t border-slate-800/80">
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="py-1.5 px-2">Transition</th>
                  <th className="py-1.5 px-2">Action Description</th>
                  <th className="py-1.5 px-2 text-right">Times Executed</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dynamicTransitions.map((t) => (
                  <tr
                    key={t.id}
                    className={`transition-colors ${t.active ? 'bg-cyan-500/10 text-cyan-200' : 'hover:bg-slate-900/50'}`}
                  >
                    <td className="py-1.5 px-2 font-bold text-cyan-300 whitespace-nowrap">
                      {t.from} → {t.to}
                    </td>
                    <td className="py-1.5 px-2 text-slate-300">{t.label}</td>
                    <td className="py-1.5 px-2 text-right text-slate-200 font-bold">{t.count}</td>
                    <td className="py-1.5 px-2">
                      {t.status === 'executed' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          Executed
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Unreached</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
