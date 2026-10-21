export type PdaState = 'q0' | 'q1' | 'q_accept' | 'q_reject';

export type ActionType = 
  | 'INIT'
  | 'PUSH'
  | 'MATCH_POP'
  | 'READ'
  | 'IGNORE_STRING'
  | 'ACCEPT'
  | 'REJECT';

export interface TransitionStep {
  step: number;
  charIndex: number;
  char: string;
  displayChar: string;
  line: number;
  column: number;
  action: ActionType;
  pushedSymbol?: string;
  poppedSymbol?: string;
  stateBefore: PdaState;
  stateAfter: PdaState;
  stackBefore: string[]; // bottom to top, e.g. ['$', '{']
  stackAfter: string[];  // bottom to top
  explanation: string;
  inString: boolean;
  isError?: boolean;
  transitionRule: string; // e.g. "δ(q1, '{', Z) = (q1, '{' Z)"
}

export interface SimulationStats {
  pushCount: number;
  popCount: number;
  readCount: number;
  stringCharCount: number;
  maxStackDepth: number;
}

export interface SimulationResult {
  isAccepted: boolean;
  pdaStructuralValid: boolean;
  jsonSyntaxValid: boolean;
  jsonSyntaxError?: string | null;
  steps: TransitionStep[];
  errorStepIndex?: number | null;
  errorMessage?: string | null;
  errorPosition?: { line: number; column: number; charIndex: number } | null;
  finalState: PdaState;
  finalStack: string[];
  totalChars: number;
  stats: SimulationStats;
}

export interface ExampleCase {
  id: string;
  name: string;
  category: 'valid' | 'mismatch' | 'unclosed' | 'syntax' | 'string_delims' | 'deep_nest';
  description: string;
  expectedResult: 'ACCEPT' | 'REJECT';
  json: string;
}
