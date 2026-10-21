import type { PdaState, SimulationResult, TransitionStep } from '../types/pda';

/**
 * Runs a complete, deterministic PDA simulation for JSON structural validation
 * coupled with a full JSON syntax verification pass.
 */
export function runPdaSimulation(rawInput: string): SimulationResult {
  const steps: TransitionStep[] = [];
  const stack: string[] = ['$']; // Bottom-of-stack marker
  let currentState: PdaState = 'q0';
  let inString = false;
  let escaped = false;
  let hasError = false;
  let errorMessage: string | null = null;
  let errorStepIndex: number | null = null;
  let errorPosition: { line: number; column: number; charIndex: number } | null = null;

  let pushCount = 0;
  let popCount = 0;
  let readCount = 0;
  let stringCharCount = 0;
  let maxStackDepth = 0;

  // Initial step 0: Initialization
  steps.push({
    step: 0,
    charIndex: -1,
    char: '',
    displayChar: 'START',
    line: 1,
    column: 0,
    action: 'INIT',
    stateBefore: 'q0',
    stateAfter: 'q0',
    stackBefore: ['$'],
    stackAfter: ['$'],
    explanation: "Initialized PDA in start state q0. Bottom-of-stack marker '$' loaded onto stack.",
    inString: false,
    transitionRule: "Initial: Stack = ['Z₀' = '$']",
  });

  if (rawInput.trim().length === 0) {
    // Empty input edge case
    steps.push({
      step: 1,
      charIndex: 0,
      char: '',
      displayChar: 'EOF',
      line: 1,
      column: 1,
      action: 'REJECT',
      stateBefore: 'q0',
      stateAfter: 'q_reject',
      stackBefore: ['$'],
      stackAfter: ['$'],
      explanation: 'Empty input provided. JSON requires a root object, array, or primitive value.',
      inString: false,
      isError: true,
      transitionRule: 'δ(q0, ε, $) = (q_reject, EMPTY)',
    });

    return {
      isAccepted: false,
      pdaStructuralValid: false,
      jsonSyntaxValid: false,
      jsonSyntaxError: 'Empty input',
      steps,
      errorStepIndex: 1,
      errorMessage: 'Empty input provided.',
      errorPosition: { line: 1, column: 1, charIndex: 0 },
      finalState: 'q_reject',
      finalStack: ['$'],
      totalChars: 0,
      stats: { pushCount: 0, popCount: 0, readCount: 0, stringCharCount: 0, maxStackDepth: 0 },
    };
  }

  // Pre-calculate line and column for each index
  let line = 1;
  let col = 0;

  for (let i = 0; i < rawInput.length; i++) {
    const char = rawInput[i];
    col++;

    if (char === '\n') {
      line++;
      col = 0;
    }

    const stateBefore: PdaState = currentState === 'q0' ? 'q1' : currentState;
    const stackBefore = [...stack];
    let action: TransitionStep['action'] = 'READ';
    let pushedSymbol: string | undefined;
    let poppedSymbol: string | undefined;
    let explanation = '';
    let transitionRule = '';
    const wasInString = inString;

    // Handle characters inside string literals
    if (inString) {
      stringCharCount++;
      if (escaped) {
        escaped = false;
        action = 'IGNORE_STRING';
        explanation = `Escaped character "${char}" inside string literal. Stack preserved.`;
        transitionRule = 'δ(q1, escaped_char, Z) = (q1, Z)';
      } else if (char === '\\') {
        escaped = true;
        action = 'IGNORE_STRING';
        explanation = 'Backslash escape prefix inside string. Next character will be escaped.';
        transitionRule = 'δ(q1, "\\", Z) = (q1, Z)';
      } else if (char === '"') {
        inString = false;
        action = 'IGNORE_STRING';
        explanation = 'Closing quote `"` detected. Exited string literal mode.';
        transitionRule = 'δ(q1, \'"\', Z) = (q1, Z)';
      } else {
        action = 'IGNORE_STRING';
        if (char === '{' || char === '}' || char === '[' || char === ']') {
          explanation = `Delimiter "${char}" is inside a string literal. Ignored by PDA stack.`;
        } else {
          explanation = `String literal character "${char}". Stack preserved.`;
        }
        transitionRule = 'δ(q1, str_char, Z) = (q1, Z)';
      }

      currentState = 'q1';

      steps.push({
        step: steps.length,
        charIndex: i,
        char,
        displayChar: char === '\n' ? '↵' : char === '\t' ? '⇥' : char === ' ' ? '␣' : char,
        line,
        column: col,
        action,
        stateBefore,
        stateAfter: currentState,
        stackBefore,
        stackAfter: [...stack],
        explanation,
        inString: wasInString,
        transitionRule,
      });

      continue;
    }

    // Outside of string literal
    if (char === '"') {
      stringCharCount++;
      inString = true;
      action = 'IGNORE_STRING';
      explanation = 'Opening quote `"` detected. Entering string literal mode.';
      transitionRule = 'δ(q1, \'"\', Z) = (q1, Z)';
      currentState = 'q1';

      steps.push({
        step: steps.length,
        charIndex: i,
        char,
        displayChar: '"',
        line,
        column: col,
        action,
        stateBefore,
        stateAfter: currentState,
        stackBefore,
        stackAfter: [...stack],
        explanation,
        inString: false,
        transitionRule,
      });

      continue;
    }

    // Structural Delimiters
    if (char === '{') {
      pushCount++;
      stack.push('{');
      pushedSymbol = '{';
      action = 'PUSH';
      currentState = 'q1';
      explanation = "Opening object delimiter '{'. Pushed '{' onto stack.";
      const topBelow = stackBefore[stackBefore.length - 1];
      transitionRule = `δ(q1, '{', ${topBelow}) = (q1, '{' ${topBelow})`;
    } else if (char === '[') {
      pushCount++;
      stack.push('[');
      pushedSymbol = '[';
      action = 'PUSH';
      currentState = 'q1';
      explanation = "Opening array delimiter '['. Pushed '[' onto stack.";
      const topBelow = stackBefore[stackBefore.length - 1];
      transitionRule = `δ(q1, '[', ${topBelow}) = (q1, '[' ${topBelow})`;
    } else if (char === '}') {
      const top = stack[stack.length - 1];
      if (top === '{') {
        popCount++;
        stack.pop();
        poppedSymbol = '{';
        action = 'MATCH_POP';
        currentState = 'q1';
        explanation = "Closing object delimiter '}' matches '{' at stack top. Popped '{'.";
        transitionRule = "δ(q1, '}', '{') = (q1, ε)";
      } else {
        // Mismatch!
        hasError = true;
        currentState = 'q_reject';
        action = 'REJECT';
        if (top === '$') {
          explanation = "Unmatched closing '}'! Stack top is '$' (no opening '{' exists). REJECTED.";
          transitionRule = "δ(q1, '}', $) = (q_reject, ERROR)";
        } else {
          explanation = `Mismatched delimiter! Read '}', but stack top is '${top}'. Expected ']' to close '${top}'. REJECTED.`;
          transitionRule = `δ(q1, '}', ${top}) = (q_reject, MISMATCH)`;
        }
        errorMessage = explanation;
        errorPosition = { line, column: col, charIndex: i };
      }
    } else if (char === ']') {
      const top = stack[stack.length - 1];
      if (top === '[') {
        popCount++;
        stack.pop();
        poppedSymbol = '[';
        action = 'MATCH_POP';
        currentState = 'q1';
        explanation = "Closing array delimiter ']' matches '[' at stack top. Popped '['.";
        transitionRule = "δ(q1, ']', '[') = (q1, ε)";
      } else {
        // Mismatch!
        hasError = true;
        currentState = 'q_reject';
        action = 'REJECT';
        if (top === '$') {
          explanation = "Unmatched closing ']'! Stack top is '$' (no opening '[' exists). REJECTED.";
          transitionRule = "δ(q1, ']', $) = (q_reject, ERROR)";
        } else {
          explanation = `Mismatched delimiter! Read ']', but stack top is '${top}'. Expected '}' to close '${top}'. REJECTED.`;
          transitionRule = `δ(q1, ']', ${top}) = (q_reject, MISMATCH)`;
        }
        errorMessage = explanation;
        errorPosition = { line, column: col, charIndex: i };
      }
    } else {
      // Ordinary character outside string (colon, comma, numbers, booleans, whitespace)
      readCount++;
      action = 'READ';
      currentState = 'q1';
      const top = stack[stack.length - 1];
      if (char === ':') {
        explanation = "Key-value separator ':' read. Stack preserved.";
        transitionRule = `δ(q1, ':', ${top}) = (q1, ${top})`;
      } else if (char === ',') {
        explanation = "Member separator ',' read. Stack preserved.";
        transitionRule = `δ(q1, ',', ${top}) = (q1, ${top})`;
      } else if (/\s/.test(char)) {
        explanation = "Whitespace character skipped. Stack preserved.";
        transitionRule = `δ(q1, whitespace, ${top}) = (q1, ${top})`;
      } else {
        explanation = `Literal/primitive character "${char}" read. Stack preserved.`;
        transitionRule = `δ(q1, '${char}', ${top}) = (q1, ${top})`;
      }
    }

    const currentDepth = Math.max(0, stack.length - 1);
    if (currentDepth > maxStackDepth) {
      maxStackDepth = currentDepth;
    }

    steps.push({
      step: steps.length,
      charIndex: i,
      char,
      displayChar: char === '\n' ? '↵' : char === '\t' ? '⇥' : char === ' ' ? '␣' : char,
      line,
      column: col,
      action,
      pushedSymbol,
      poppedSymbol,
      stateBefore,
      stateAfter: currentState,
      stackBefore,
      stackAfter: [...stack],
      explanation,
      inString: false,
      isError: hasError,
      transitionRule,
    });

    if (hasError) {
      errorStepIndex = steps.length - 1;
      break;
    }
  }

  // End of input processing
  let pdaStructuralValid = false;
  let jsonSyntaxValid = false;
  let jsonSyntaxError: string | null = null;

  if (!hasError) {
    if (inString) {
      hasError = true;
      currentState = 'q_reject';
      errorMessage = 'Unterminated string literal at End-Of-Input.';
      errorPosition = { line, column: col + 1, charIndex: rawInput.length };
      steps.push({
        step: steps.length,
        charIndex: rawInput.length,
        char: '',
        displayChar: 'EOF',
        line,
        column: col + 1,
        action: 'REJECT',
        stateBefore: 'q1',
        stateAfter: 'q_reject',
        stackBefore: [...stack],
        stackAfter: [...stack],
        explanation: 'Input ended while still inside an unclosed string literal. REJECTED.',
        inString: true,
        isError: true,
        transitionRule: 'δ(q1, EOF, in_string) = (q_reject, UNCLOSED_STRING)',
      });
      errorStepIndex = steps.length - 1;
    } else if (stack.length > 1) {
      // Unclosed delimiters remain in stack!
      hasError = true;
      currentState = 'q_reject';
      const unclosedList = stack.slice(1).reverse().map(s => `'${s}'`).join(', ');
      errorMessage = `End of input reached, but stack still contains ${stack.length - 1} unclosed delimiter(s): [${unclosedList}].`;
      errorPosition = { line, column: col + 1, charIndex: rawInput.length };
      steps.push({
        step: steps.length,
        charIndex: rawInput.length,
        char: '',
        displayChar: 'EOF',
        line,
        column: col + 1,
        action: 'REJECT',
        stateBefore: 'q1',
        stateAfter: 'q_reject',
        stackBefore: [...stack],
        stackAfter: [...stack],
        explanation: errorMessage,
        inString: false,
        isError: true,
        transitionRule: `δ(q1, EOF, ${stack[stack.length - 1]}) = (q_reject, UNCLOSED_STACK)`,
      });
      errorStepIndex = steps.length - 1;
    } else {
      // Stack has only ['$'] -> PDA structural nesting test PASSED!
      pdaStructuralValid = true;

      // Now verify complete JSON syntax via JSON.parse
      try {
        JSON.parse(rawInput);
        jsonSyntaxValid = true;
        currentState = 'q_accept';
        steps.push({
          step: steps.length,
          charIndex: rawInput.length,
          char: '',
          displayChar: 'EOF',
          line,
          column: col + 1,
          action: 'ACCEPT',
          stateBefore: 'q1',
          stateAfter: 'q_accept',
          stackBefore: ['$'],
          stackAfter: ['$'],
          explanation: 'All delimiters matched & popped. Stack reduced to bottom marker "$". Full JSON syntax verified valid. String is ACCEPTED!',
          inString: false,
          transitionRule: 'δ(q1, ε, $) = (q_accept, $)',
        });
      } catch (err: unknown) {
        jsonSyntaxValid = false;
        currentState = 'q_reject';
        const parseErrMsg = err instanceof Error ? err.message : String(err);
        jsonSyntaxError = parseErrMsg;
        hasError = true;
        errorMessage = `PDA Delimiter Check Passed, but Full JSON Syntax Failed: ${parseErrMsg}`;
        
        // Extract line/column from JSON.parse error message if available
        const posMatch = parseErrMsg.match(/position (\d+)/i);
        const lineMatch = parseErrMsg.match(/line (\d+) column (\d+)/i);
        if (lineMatch) {
          errorPosition = { line: parseInt(lineMatch[1]), column: parseInt(lineMatch[2]), charIndex: posMatch ? parseInt(posMatch[1]) : rawInput.length };
        } else if (posMatch) {
          errorPosition = { line, column: col, charIndex: parseInt(posMatch[1]) };
        } else {
          errorPosition = { line, column: col + 1, charIndex: rawInput.length };
        }

        steps.push({
          step: steps.length,
          charIndex: errorPosition ? errorPosition.charIndex : rawInput.length,
          char: '',
          displayChar: 'EOF',
          line: errorPosition ? errorPosition.line : line,
          column: errorPosition ? errorPosition.column : col + 1,
          action: 'REJECT',
          stateBefore: 'q1',
          stateAfter: 'q_reject',
          stackBefore: ['$'],
          stackAfter: ['$'],
          explanation: `PDA stack matched all delimiters, but complete JSON grammar failed: ${parseErrMsg} (e.g. trailing comma or missing quotes).`,
          inString: false,
          isError: true,
          transitionRule: 'δ(q1, ε, $) = (q_reject, SYNTAX_ERROR)',
        });
        errorStepIndex = steps.length - 1;
      }
    }
  }

  const isAccepted = currentState === 'q_accept' && pdaStructuralValid && jsonSyntaxValid;

  return {
    isAccepted,
    pdaStructuralValid,
    jsonSyntaxValid,
    jsonSyntaxError,
    steps,
    errorStepIndex,
    errorMessage,
    errorPosition,
    finalState: currentState,
    finalStack: [...stack],
    totalChars: rawInput.length,
    stats: {
      pushCount,
      popCount,
      readCount,
      stringCharCount,
      maxStackDepth,
    },
  };
}
