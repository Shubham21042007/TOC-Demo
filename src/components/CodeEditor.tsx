import React, { useRef, useEffect, useState, useMemo } from 'react';
import { FileCode, AlertCircle, Edit3, Eye } from 'lucide-react';
import type { TransitionStep } from '../types/pda';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  currentStep?: TransitionStep;
  isSimulating: boolean;
  disabled?: boolean;
}

interface ParsedLine {
  lineNum: number;
  chars: Array<{
    char: string;
    idx: number;
    col: number;
  }>;
  newlineIdx: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  currentStep,
  isSimulating,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  // Manual edit mode toggle if user wants to edit while simulation is active
  const [manualEditMode, setManualEditMode] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  // When isSimulating becomes true (user runs simulation or steps), exit manual edit mode
  useEffect(() => {
    if (isSimulating) {
      setManualEditMode(false);
    }
  }, [isSimulating, currentStep?.step]);

  // Track cursor position when user clicks or types in textarea
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const selStart = textareaRef.current.selectionStart;
    const textUpToCursor = value.substring(0, selStart);
    const textLines = textUpToCursor.split('\n');
    const line = textLines.length;
    const col = textLines[textLines.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleViewerScroll = () => {
    if (viewerRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = viewerRef.current.scrollTop;
    }
  };

  // Pre-calculate line numbers and global character indices for every single character
  const parsedLines: ParsedLine[] = useMemo(() => {
    const result: ParsedLine[] = [];
    const rawLines = value.split('\n');
    let currentIdx = 0;

    for (let i = 0; i < rawLines.length; i++) {
      const lineText = rawLines[i];
      const lineNum = i + 1;
      const chars: ParsedLine['chars'] = [];

      for (let c = 0; c < lineText.length; c++) {
        chars.push({
          char: lineText[c],
          idx: currentIdx,
          col: c + 1
        });
        currentIdx++;
      }

      const newlineIdx = currentIdx; // Position of the '\n' character
      if (i < rawLines.length - 1) {
        currentIdx++; // Advance past '\n'
      }

      result.push({
        lineNum,
        chars,
        newlineIdx
      });
    }

    return result;
  }, [value]);

  // Auto-scroll the active character into view as simulation steps advance
  useEffect(() => {
    if (isSimulating && !manualEditMode && activeCharRef.current && viewerRef.current) {
      activeCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [currentStep?.charIndex, isSimulating, manualEditMode]);

  // Sync line numbers scroll when simulating
  useEffect(() => {
    if (isSimulating && !manualEditMode && currentStep?.line && lineNumbersRef.current) {
      const approxLineHeight = 24;
      const targetScroll = Math.max(0, (currentStep.line - 3) * approxLineHeight);
      lineNumbersRef.current.scrollTop = targetScroll;
      if (viewerRef.current) {
        viewerRef.current.scrollTop = targetScroll;
      }
    }
  }, [currentStep?.line, isSimulating, manualEditMode]);

  const activeCharIndex = isSimulating && currentStep ? currentStep.charIndex : -1;
  const isPointerActive = isSimulating && !manualEditMode && activeCharIndex >= 0;

  return (
    <div className="relative flex flex-col rounded-xl bg-[#030611] border border-cyan-500/20 overflow-hidden font-mono shadow-inner shadow-black/60">
      
      {/* Top Editor Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#060b18] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">JSON Input Editor</span>
          
          {/* Active Mode Badge */}
          {isPointerActive ? (
            <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              Live Pointer Active
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              Editable Text
            </span>
          )}
        </div>

        {/* Right Info & Toggle */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {isPointerActive && currentStep ? (
            <span className="text-cyan-300 flex items-center gap-1 font-mono font-bold">
              Line {currentStep.line}, Col {currentStep.column}
              {currentStep.inString && (
                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-700/40">
                  inside string
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 font-mono">
              Line {cursorPos.line}, Col {cursorPos.col}
            </span>
          )}

          {/* Toggle between Edit Mode and Pointer View if simulating */}
          {isSimulating && (
            <button
              onClick={() => {
                setManualEditMode(!manualEditMode);
                if (!manualEditMode) {
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }
              }}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {manualEditMode ? (
                <>
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Show Pointer</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3 text-cyan-400" />
                  <span>Edit Input</span>
                </>
              )}
            </button>
          )}

          <span>{parsedLines.length} {parsedLines.length === 1 ? 'line' : 'lines'}</span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex min-h-[220px] max-h-[320px] h-[250px] overflow-hidden text-sm">
        
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="select-none py-3 px-3 bg-[#050914] border-r border-slate-800/80 text-slate-500 text-right font-mono text-xs overflow-hidden leading-6 min-w-[42px]"
        >
          {parsedLines.map((lineData) => {
            const isCurrentLine = isPointerActive && currentStep?.line === lineData.lineNum;
            return (
              <div
                key={lineData.lineNum}
                className={`transition-colors ${
                  isCurrentLine ? 'text-cyan-300 font-extrabold bg-cyan-500/20 -mx-3 px-3' : ''
                }`}
              >
                {lineData.lineNum}
              </div>
            );
          })}
        </div>

        {/* Center: Either Live Moving Pointer Viewer OR Editable Textarea */}
        <div className="relative flex-1 h-full overflow-hidden">
          
          {/* 1. Live Pointer Viewer Layer (When Simulating) */}
          {isPointerActive ? (
            <div
              ref={viewerRef}
              onScroll={handleViewerScroll}
              className="w-full h-full py-3 px-4 overflow-auto font-mono text-xs sm:text-sm leading-6 whitespace-pre select-text focus:outline-none"
            >
              {parsedLines.map((lineData, lineIdx) => {
                const isCurrentLine = currentStep?.line === lineData.lineNum;

                return (
                  <div
                    key={lineData.lineNum}
                    className={`min-h-[24px] ${
                      isCurrentLine 
                        ? 'bg-cyan-950/30 border-l-2 border-cyan-400/80 -mx-4 px-4 transition-colors' 
                        : 'border-l-2 border-transparent -mx-4 px-4'
                    }`}
                  >
                    {/* Render each character on this line */}
                    {lineData.chars.map((charObj) => {
                      const isActive = charObj.idx === activeCharIndex;
                      const isPast = charObj.idx < activeCharIndex;

                      if (isActive) {
                        return (
                          <span
                            key={charObj.idx}
                            ref={activeCharRef}
                            className="relative inline-block bg-cyan-400 text-black font-extrabold px-0.5 rounded-[2px] ring-2 ring-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.95)] z-20 scale-110 transition-all duration-100"
                          >
                            {/* Animated floating arrow above active character */}
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-extrabold pointer-events-none drop-shadow-[0_0_6px_#22d3ee] animate-pulse">
                              ▼
                            </span>
                            {charObj.char === ' ' ? '␣' : charObj.char === '\t' ? '⇥' : charObj.char}
                          </span>
                        );
                      }

                      // Non-active characters
                      let tokenColor = isPast ? 'text-slate-200' : 'text-slate-400 opacity-90';
                      if (charObj.char === '{' || charObj.char === '}') {
                        tokenColor = 'text-sky-300 font-semibold';
                      } else if (charObj.char === '[' || charObj.char === ']') {
                        tokenColor = 'text-violet-300 font-semibold';
                      } else if (charObj.char === ':') {
                        tokenColor = 'text-slate-400 font-bold';
                      } else if (charObj.char === ',') {
                        tokenColor = 'text-slate-400';
                      }

                      return (
                        <span key={charObj.idx} className={tokenColor}>
                          {charObj.char}
                        </span>
                      );
                    })}

                    {/* Newline Character Highlight */}
                    {lineIdx < parsedLines.length - 1 && (
                      <span
                        key={`nl-${lineData.lineNum}`}
                        ref={lineData.newlineIdx === activeCharIndex ? activeCharRef : null}
                        className={
                          lineData.newlineIdx === activeCharIndex
                            ? 'relative inline-block bg-cyan-400 text-black font-extrabold px-1 rounded-[2px] ring-2 ring-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.95)] z-20 scale-110 ml-0.5 transition-all duration-100'
                            : 'text-slate-600 opacity-30 select-none'
                        }
                      >
                        {lineData.newlineIdx === activeCharIndex && (
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-extrabold pointer-events-none drop-shadow-[0_0_6px_#22d3ee] animate-pulse">
                            ▼
                          </span>
                        )}
                        {lineData.newlineIdx === activeCharIndex ? '↵' : ''}
                      </span>
                    )}

                    {/* EOF Marker Highlight at End of Last Line */}
                    {lineIdx === parsedLines.length - 1 && activeCharIndex >= value.length && (
                      <span
                        ref={activeCharRef}
                        className="relative inline-block bg-cyan-400 text-black font-extrabold text-[10px] px-1 rounded-[2px] ring-2 ring-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.95)] z-20 scale-110 ml-1 transition-all duration-100"
                      >
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-extrabold pointer-events-none drop-shadow-[0_0_6px_#22d3ee] animate-pulse">
                          ▼
                        </span>
                        EOF
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. Standard Editable Textarea (Stage 1 Setup or Manual Edit Mode) */
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                updateCursorPosition();
              }}
              onKeyUp={updateCursorPosition}
              onClick={updateCursorPosition}
              onSelect={updateCursorPosition}
              onScroll={handleTextareaScroll}
              disabled={disabled}
              placeholder='Type or paste custom JSON here, e.g. {"course": "TOC", "valid": true}'
              spellCheck={false}
              className={`w-full h-full py-3 px-4 bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-6 resize-none outline-none focus:ring-1 focus:ring-cyan-500/30 selection:bg-cyan-500/30 selection:text-cyan-100 ${
                disabled ? 'cursor-not-allowed opacity-90' : ''
              }`}
            />
          )}

        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-[#050914] border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-500" />
          {isPointerActive 
            ? 'Live PDA moving pointer tracks each token sequentially'
            : 'Type or edit JSON freely, then click Run Simulation'}
        </span>
        <span className="font-mono text-slate-400">
          {value.length} characters
        </span>
      </div>

    </div>
  );
};
