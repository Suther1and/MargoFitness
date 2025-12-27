import { SolutionSection } from './solution-section'

export function ProblemSection() {
  return (
    <section className="bg-white border-neutral-200 border-t pt-14 pb-10">
      <div className="md:px-12 max-w-7xl mr-auto ml-auto pr-6 pl-6">
        <div className="flex flex-col md:flex-row mb-16 gap-x-8 gap-y-8 items-end justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2 block">
              The Structural Problem
            </span>
            <h3 className="md:text-5xl text-4xl font-medium text-neutral-900 tracking-tight font-oswald">
              From Door-to-Door to "Social Selling" & Agentic AI Era
            </h3>
            <p className="leading-relaxed text-neutral-600 mt-4">
              The traditional MLM model is limited. Technology has reconfigured
              the channel but amplified inefficiencies, creating a multi-billion
              dollar battlefield.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-neutral-200 w-12 h-1 rounded-full"></div>
            <div className="w-12 h-1 bg-neutral-900 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-colors group">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.25rem"
                height="1.25rem"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 21a8 8 0 0 0-16 0"></path>
                <circle cx="10" cy="8" r="5"></circle>
                <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"></path>
              </svg>
            </div>
            <h4 className="text-lg font-semibold font-oswald uppercase mb-3">
              Retention Crisis
            </h4>
            <p className="text-base text-neutral-600 leading-relaxed">
              Between 50% and 70% drop out in the first year. 73% fail,
              generating a social stigma of "burning" contacts.
            </p>
          </div>

          <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-colors group">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.25rem"
                height="1.25rem"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h4 className="text-lg font-semibold font-oswald uppercase mb-3">
              Hidden 80% Cost
            </h4>
            <p className="text-base text-neutral-600 leading-relaxed">
              Inefficient time arbitrage. Leaders invest 80% of their day in
              micromanagement and basic coaching.
            </p>
          </div>

          <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-colors group">
            <div className="w-10 h-10 bg-neutral-200 text-neutral-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.25rem"
                height="1.25rem"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>
            <h4 className="text-lg font-semibold font-oswald uppercase mb-3">
              Regulatory Risk
            </h4>
            <p className="text-base text-neutral-600 leading-relaxed">
              Scrutiny from bodies like the FTC demands compliance. A millionaire
              financial and reputational risk.
            </p>
          </div>
        </div>

        <SolutionSection />
      </div>
    </section>
  )
}

