import { TrendingUp, AlertTriangle, DollarSign } from './icons'

const problems = [
  {
    icon: TrendingUp,
    stat: "4×",
    label: "higher LLM spend—2024 vs 2023",
    description: "Enterprise AI costs quadrupled year-over-year."
  },
  {
    icon: DollarSign,
    stat: "$50 000+",
    label: "/ mo",
    sublabel: "for mid-size SaaS teams",
    description: "Premium models driving unsustainable monthly bills."
  },
  {
    icon: AlertTriangle,
    stat: "70%",
    label: "of queries run fine on models under $1 / M tokens",
    description: "Most requests overpay for unnecessary capability."
  }
]

export const Problem = () => {
  return (
    <section className="pt-32 pb-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            AI Model Costs Are <span className="inline-block pb-0 bg-gradient-to-r from-red-500/80 to-red-400/80 bg-[length:100%_4px] bg-bottom bg-no-repeat">Exploding</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-14 max-w-5xl mx-auto">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={i}
                className="text-center bg-slate-900/60 p-4 sm:p-6 rounded-2xl ring-1 ring-slate-700/50 
                           hover:-translate-y-1 transition-transform w-full max-w-sm mx-auto"
              >
                <div className="mx-auto mb-4 p-3 rounded-full bg-slate-800 w-fit ring-1 ring-slate-700/50">
                  <Icon className="h-6 w-6 stroke-[2] stroke-red-500 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-red-500 mb-2">{problem.stat}</div>
                <div className="font-semibold mb-2 text-slate-100">
                  {problem.label}
                  {problem.sublabel && <div className="text-sm font-normal text-slate-300">{problem.sublabel}</div>}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {i === 0 ? (
                    <>Enterprise AI costs <strong>quadrupled</strong> year-over-year.</>
                  ) : (
                    problem.description
                  )}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            The answer isn&apos;t <em>&quot;use cheap models everywhere&quot;</em>—it&apos;s{' '}
            <span className="font-semibold text-white">use the right model for each request.</span>{' '}
            Sleipner handles that for you.
          </p>
        </div>
      </div>
    </section>
  )
} 