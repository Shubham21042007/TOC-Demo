import { GraduationCap, Award, Users, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 border-b border-cyan-500/10 bg-gradient-to-t from-[#040712] to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic Presentation Project</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            About the Project & Team Credits
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            Built for the Theory of Computation (TOC) FA2 Group Presentation. 
            Demonstrating theoretical automata principles through practical software visualization.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Course & Assessment Details */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Course & Evaluation</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Subject</span>
                <span className="font-semibold text-cyan-300 text-sm">Theory of Computation (TOC)</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Evaluation Milestone</span>
                <span className="font-semibold text-slate-200">FA2 Group Presentation & Lab Simulation</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Core Topics Covered</span>
                <span className="text-slate-300">Deterministic Pushdown Automata (DPDA), Context-Free Grammars (CFG), Chomsky Hierarchy, Parsing</span>
              </div>
            </div>
          </div>

          {/* Card 2: Academic Objective */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Pedagogical Objective</h3>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>
                To bridge the abstract mathematics of <strong>Pushdown Automata</strong> and <strong>Formal Grammars</strong> with everyday software engineering.
              </p>
              <p className="text-slate-400">
                Students and teachers can interactively inspect how stack transitions enforce syntax correctness, proving why finite automata (DFAs) are mathematically insufficient for nested JSON.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Client-Side In-Browser Execution</span>
              </div>
            </div>
          </div>

          {/* Card 3: Group Presentation Credits */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Project Group</h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#030611] border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
                  TOC FA2 Presentation Team
                </span>
                <p className="text-slate-200 font-medium">
                  Theory of Computation Laboratory Group
                </p>
                <p className="text-slate-400 text-[11px]">
                  Computer Science & Engineering Department
                </p>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Created for live teacher demonstration and peer review with step-by-step interactive visualization.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PDA LAB • Pushdown Automata Behind JSON Validation
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            Designed for Live Classroom Demonstration <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </span>
        </div>

      </div>
    </section>
  );
};
