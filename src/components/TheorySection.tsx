import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Cpu, 
  Binary, 
  Compass, 
  Code2, 
  CheckCircle, 
  Network
} from 'lucide-react';

export const TheorySection: React.FC = () => {
  const cards = [
    {
      title: '1. What is JSON & Why Nesting Matters?',
      icon: Code2,
      accent: 'cyan',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            <strong>JSON (JavaScript Object Notation)</strong> is the universal data interchange format of modern computing.
          </p>
          <p>
            Unlike tabular or flat formats, JSON objects and arrays can be nested to <em>arbitrary depth</em>:
          </p>
          <div className="p-2 rounded bg-[#030611] font-mono text-cyan-300 border border-slate-800">
            {'{ "a": { "b": [ { "c": 1 } ] } }'}
          </div>
          <p className="text-slate-400">
            Validating this requires matching opening braces with closing braces across multiple nesting layers.
          </p>
        </div>
      ),
    },
    {
      title: '2. The Stack & LIFO Principle',
      icon: Layers,
      accent: 'blue',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            A <strong>Stack</strong> is a linear data structure following <strong>LIFO</strong> (Last-In, First-Out).
          </p>
          <div className="grid grid-cols-2 gap-2 my-1 font-mono text-[11px]">
            <div className="p-2 rounded bg-sky-950/50 border border-sky-800/40 text-sky-200">
              <strong>PUSH:</strong> Add item to top of stack
            </div>
            <div className="p-2 rounded bg-emerald-950/50 border border-emerald-800/40 text-emerald-200">
              <strong>POP:</strong> Remove the most recent item from top
            </div>
          </div>
          <p className="text-slate-400">
            Because inner nested scopes close before outer scopes, the stack naturally mirrors hierarchical nesting!
          </p>
        </div>
      ),
    },
    {
      title: '3. What is a Pushdown Automaton (PDA)?',
      icon: Cpu,
      accent: 'violet',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            A <strong>Pushdown Automaton</strong> is a Finite State Machine equipped with an <strong>infinite-capacity Stack</strong>.
          </p>
          <div className="p-2 rounded bg-violet-950/40 border border-violet-800/40 text-violet-200 font-mono text-xs">
            PDA = DFA + Stack Memory (LIFO)
          </div>
          <p className="text-slate-400">
            While a DFA/NFA can only remember a fixed finite number of states, a PDA uses its stack to count and match arbitrarily deep nesting.
          </p>
        </div>
      ),
    },
    {
      title: '4. Formal 7-Tuple Definition',
      icon: Binary,
      accent: 'cyan',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p className="font-mono text-cyan-300 font-bold bg-cyan-950/60 p-1.5 rounded border border-cyan-800/40">
            M = (Q, Σ, Γ, δ, q₀, Z₀, F)
          </p>
          <ul className="space-y-1 font-mono text-[11px]">
            <li><span className="text-cyan-400 font-bold">Q:</span> Finite set of internal states</li>
            <li><span className="text-sky-400 font-bold">Σ:</span> Finite input alphabet (characters)</li>
            <li><span className="text-violet-400 font-bold">Γ:</span> Finite stack alphabet ({'{ "{", "[", "$" }'})</li>
            <li><span className="text-amber-400 font-bold">δ:</span> Transition function: Q × (Σ ∪ {'{ε}'}) × Γ → Q × Γ*</li>
            <li><span className="text-emerald-400 font-bold">q₀:</span> Initial start state</li>
            <li><span className="text-emerald-400 font-bold">Z₀:</span> Initial bottom-of-stack marker ($)</li>
            <li><span className="text-emerald-400 font-bold">F:</span> Set of accepting states ({'{ q_accept }'})</li>
          </ul>
        </div>
      ),
    },
    {
      title: '5. Why Regular Expressions (DFA) Fail',
      icon: Compass,
      accent: 'rose',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            By the <strong>Pumping Lemma for Regular Languages</strong>, a DFA cannot recognize the language of balanced parentheses:
          </p>
          <div className="p-1.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 font-mono text-xs">
            L = {'{ {ⁿ }ⁿ | n ≥ 0 }'} ∉ REG
          </div>
          <p className="text-slate-400">
            A DFA has finite memory and cannot count unbounded opening brackets. 
            Therefore, regular expressions <strong>cannot</strong> parse nested JSON!
          </p>
        </div>
      ),
    },
    {
      title: '6. PDA Structure vs Full JSON Parsing',
      icon: CheckCircle,
      accent: 'emerald',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            A pure delimiter PDA checks whether brackets balance:
          </p>
          <div className="p-1.5 rounded bg-[#030611] border border-slate-800 font-mono text-amber-300 text-[11px]">
            {'{ "a": 1, }'} → Stack balances, BUT syntax invalid!
          </div>
          <p className="text-slate-400">
            A real-world JSON parser pairs the PDA stack with recursive-descent syntax checking for commas, colons, numbers, and strings.
          </p>
        </div>
      ),
    },
    {
      title: '7. Real-World Applications',
      icon: Network,
      accent: 'indigo',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            The PDA concept is used throughout modern software infrastructure:
          </p>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            <li><strong>Compilers:</strong> AST generation in GCC, Clang, Rustc</li>
            <li><strong>Browser Engines:</strong> Google V8 & SpiderMonkey JS parsers</li>
            <li><strong>IDEs:</strong> Bracket pair colorization in VS Code</li>
            <li><strong>HTML/XML Parsers:</strong> DOM tree reconstruction</li>
          </ul>
        </div>
      ),
    },
    {
      title: '8. PDA & CFG Equivalence',
      icon: BookOpen,
      accent: 'amber',
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>
            In the <strong>Chomsky Hierarchy (Type-2)</strong>:
          </p>
          <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs">
            Context-Free Grammars (CFGs) ≡ Pushdown Automata (PDAs)
          </div>
          <p className="text-slate-400">
            Any language generated by a CFG can be recognized by a PDA, and any language accepted by a PDA can be generated by a CFG.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section id="theory" className="py-12 border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Theoretical Foundations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Learn the Theory: Automata & Grammar
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            Curated concepts and formal proofs structured for college-level Theory of Computation presentations.
          </p>
        </div>

        {/* Educational Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {c.title}
                    </h3>
                  </div>

                  {c.content}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
