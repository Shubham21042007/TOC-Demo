import React, { useState } from 'react';
import { FileCode2, ChevronRight, ChevronDown, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeNode {
  name: string;
  type: 'nonterminal' | 'terminal' | 'literal';
  children?: TreeNode[];
  expandedDefault?: boolean;
}

const sampleParseTree: TreeNode = {
  name: 'JSON',
  type: 'nonterminal',
  children: [
    {
      name: 'OBJECT',
      type: 'nonterminal',
      children: [
        { name: '{', type: 'terminal' },
        {
          name: 'MEMBERS',
          type: 'nonterminal',
          children: [
            {
              name: 'PAIR',
              type: 'nonterminal',
              children: [
                { name: '"topic"', type: 'terminal' },
                { name: ':', type: 'terminal' },
                { name: '"TOC"', type: 'terminal' }
              ]
            },
            { name: ',', type: 'terminal' },
            {
              name: 'MEMBERS',
              type: 'nonterminal',
              children: [
                {
                  name: 'PAIR',
                  type: 'nonterminal',
                  children: [
                    { name: '"units"', type: 'terminal' },
                    { name: ':', type: 'terminal' },
                    {
                      name: 'ARRAY',
                      type: 'nonterminal',
                      children: [
                        { name: '[', type: 'terminal' },
                        {
                          name: 'ELEMENTS',
                          type: 'nonterminal',
                          children: [
                            { name: '"PDA"', type: 'terminal' },
                            { name: ',', type: 'terminal' },
                            { name: '"CFG"', type: 'terminal' }
                          ]
                        },
                        { name: ']', type: 'terminal' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        { name: '}', type: 'terminal' }
      ]
    }
  ]
};

const TreeNodeComponent: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const hasChildren = node.children && node.children.length > 0;

  const badgeColor =
    node.type === 'nonterminal'
      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/80'
      : node.name === '{' || node.name === '}' || node.name === '[' || node.name === ']'
      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';

  return (
    <div className="ml-4 pl-2 border-l border-slate-800 text-xs font-mono my-1">
      <div className="flex items-center gap-1.5 py-0.5">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 inline-block text-slate-600 text-center">•</span>
        )}

        <span
          className={`px-2 py-0.5 rounded border cursor-default transition-all ${badgeColor}`}
        >
          {node.name}
        </span>

        <span className="text-[10px] text-slate-400 font-sans">
          {node.type === 'nonterminal' ? 'Variable (V)' : 'Terminal (Σ)'}
        </span>
      </div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {node.children!.map((child, idx) => (
              <TreeNodeComponent key={idx} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CfgExplorer: React.FC = () => {
  const grammarRules = [
    { lhs: 'JSON', rhs: ['OBJECT', '|', 'ARRAY'], desc: 'Start symbol' },
    { lhs: 'OBJECT', rhs: ['{', 'MEMBERS', '}'], desc: 'Delimited by matching curly braces' },
    { lhs: 'ARRAY', rhs: ['[', 'ELEMENTS', ']'], desc: 'Delimited by matching square brackets' },
    { lhs: 'MEMBERS', rhs: ['PAIR', '|', 'PAIR', ',', 'MEMBERS'], desc: 'Recursive list of key-value pairs' },
    { lhs: 'PAIR', rhs: ['STRING', ':', 'VALUE'], desc: 'Key-value binding' },
    { lhs: 'VALUE', rhs: ['STRING', '|', 'NUMBER', '|', 'OBJECT', '|', 'ARRAY', '|', 'true', '|', 'false', '|', 'null'], desc: 'Primitives or nested structures' },
    { lhs: 'ELEMENTS', rhs: ['VALUE', '|', 'VALUE', ',', 'ELEMENTS'], desc: 'Recursive comma-separated values' },
  ];

  return (
    <section id="cfg-explorer" className="py-12 border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950 border border-violet-500/30 text-violet-300 text-xs font-mono mb-2">
            <FileCode2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Chomsky Hierarchy • Type 2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Context-Free Grammar (CFG) Explorer
          </h2>
          <p className="text-slate-400 text-sm max-w-3xl mt-1">
            Context-Free Grammars <em>generate</em> context-free languages, while Pushdown Automata 
            <em> recognize</em> them. Because JSON features recursive nested structures, it is fundamentally 
            governed by context-free syntax productions.
          </p>
        </div>

        {/* 2-Column: Grammar Rules vs Interactive Parse Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Grammar Productions */}
          <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-cyan-500/20">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Simplified JSON Grammar Productions (G)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                G = (V, Σ, R, S)
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {grammarRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#030611] border border-slate-800 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                        {rule.lhs}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-200">
                        {rule.rhs.map((token, tIdx) => {
                          const isSpecial = token === '{' || token === '}' || token === '[' || token === ']' || token === ':' || token === ',';
                          const isPipe = token === '|';
                          return (
                            <span
                              key={tIdx}
                              className={`mx-1 ${
                                isSpecial
                                  ? 'text-amber-400 font-bold'
                                  : isPipe
                                  ? 'text-slate-500'
                                  : 'text-violet-300 font-semibold'
                              }`}
                            >
                              {token}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Note on PDA & CFG Equivalence */}
            <div className="mt-4 p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-violet-300 font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Theoretical Equivalence:</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                A language is <strong>Context-Free</strong> if and only if there exists a Pushdown Automaton that recognizes it. 
                The PDA simulates the derivation of the CFG by keeping track of unmatched non-terminals and delimiters in its stack!
              </p>
            </div>
          </div>

          {/* Right Column: Visual Interactive Parse Tree */}
          <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Interactive Parse Tree Derivation
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Sample: {'{ "topic": "TOC", "units": ["PDA", "CFG"] }'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3 font-sans">
                Expand and collapse nodes to see how higher-level grammar constructs 
                derive the terminal characters that feed into the PDA input stream.
              </p>

              <div className="p-3 rounded-xl bg-[#030611] border border-slate-800 max-h-[420px] overflow-y-auto">
                <TreeNodeComponent node={sampleParseTree} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-950 border border-cyan-500" /> Non-terminal (V)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-500" /> Delimiters
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-500" /> Terminals (Σ)
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
