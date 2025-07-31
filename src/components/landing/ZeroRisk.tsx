export const ZeroRisk = () => {
  return (
    <section className="py-12 sm:py-16 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Enhanced guarantee box with subtle accent ring */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-800/40 to-slate-800/10 backdrop-blur-sm border border-slate-700/60 ring-1 ring-slate-700/50 ring-inset rounded-lg relative overflow-hidden">
            {/* Enhanced gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-lg -z-10"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Zero-Risk Pricing</h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6">
              Keep 75% of every dollar we save you. No savings? No fee.
            </p>
            <p className="text-sm text-slate-400">
              We only succeed when you succeed. Our semantic caching, compression, and routing work together to maximize your savings with our performance-based model.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}