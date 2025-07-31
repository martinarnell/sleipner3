import { Zap, ShieldCheck, Code2, Key, Coins, Database, Shrink } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Intelligent Routing',
    desc: 'Right-sizes every prompt to the cheapest capable model with semantic analysis.',
    metric: 'Up to 75% savings',
  },
  {
    icon: Database,
    title: 'Semantic Prompt Caching',
    desc: 'Smart caching recognizes similar prompts semantically, even with different wording.',
    metric: 'Up to 100% faster',
  },
  {
    icon: Shrink,
    title: 'Prompt Compression',
    desc: 'Advanced compression reduces token count while preserving meaning and context.',
    metric: 'Up to 60% shorter',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guardrails',
    desc: 'Judge models auto-retry below 90/100 score.',
    metric: '99.9% quality kept',
  },
  {
    icon: Code2,
    title: '2-Minute Integration',
    desc: 'Swap the base URL—no prompt changes, no SDK lock-in.',
    metric: '< 10 LOC',
  },
  {
    icon: Key,
    title: 'Bring Your Own Keys',
    desc: 'Forward your OpenAI / Anthropic keys; we never store them.',
    metric: 'Full data control',
  },
  {
    icon: Coins,
    title: 'Pay-as-You-Save',
    desc: '25% of realised savings; €0 if we save you €0.',
    metric: 'Zero risk',
  },
];

export const Features = () => {
  return (
    <section id="features" className="pt-20 pb-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-center text-4xl font-bold mb-4">
            Why Choose Sleipner
          </h2>
          <p className="text-center text-slate-400 mb-12">
            Advanced AI optimization that cuts spend without adding complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          {features.map(({ icon: Icon, title, desc, metric }) => (
            <div
              key={title}
              className="rounded-2xl bg-slate-900/60 p-4 sm:p-6 ring-1 ring-slate-800/50
                         hover:ring-slate-600 hover:-translate-y-1 transition transform w-full max-w-sm mx-auto"
            >
              <div className="h-11 w-11 flex items-center justify-center
                              rounded-full bg-slate-800 ring-1 ring-cyan-500/30">
                <Icon className="h-5 w-5 stroke-[2.2] text-cyan-400" aria-label={`${title} icon`} />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mt-4">
                {title}
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {desc}
              </p>
              <span className="inline-block mt-4 px-3 py-1 text-xs font-medium rounded-full
                                bg-slate-800/80 text-slate-300 ring-1 ring-blue-500/40">
                {metric}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 