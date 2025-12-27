export function SolutionSection() {
  return (
    <div className="md:p-12 overflow-hidden text-white bg-neutral-900 rounded-3xl pt-8 pr-8 pb-8 pl-8 relative mb-24">
      <div className="blur-[6.25rem] bg-blue-500/10 w-96 h-96 rounded-full absolute top-0 right-0"></div>

      <div className="relative z-10 mb-12">
        <span className="uppercase block text-xs font-semibold text-blue-400 tracking-widest mb-2">
          The AI-First Solution
        </span>
        <h3 className="md:text-5xl text-3xl font-medium tracking-tight font-oswald">
          Autonomous Agent Architecture
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 border-neutral-700 border-t">
        <div className="hidden md:contents text-xs font-space uppercase tracking-widest text-neutral-500">
          <div className="col-span-3 text-gray-50 border-neutral-800 border-b pt-4 pr-4 pb-4">
            Pain Point
          </div>
          <div className="col-span-3 text-gray-50 border-neutral-800 border-b border-l px-4 py-4">
            LINARIS Agent
          </div>
          <div className="col-span-6 text-gray-50 border-neutral-800 border-b border-l pt-4 pl-4">
            Algorithmic Solution
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 border-neutral-800 border-b pt-10 pr-4 pb-6 pl-4">
          <span className="font-medium text-red-400">High Attrition Rate</span>
        </div>
        <div className="col-span-1 md:col-span-3 md:px-4 md:border-l flex border-neutral-800 border-b pt-6 pb-6 gap-x-3 gap-y-3 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.375rem" height="1.375rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
            <path d="M12 2v2"></path>
            <path d="M12 22v-2"></path>
            <path d="m17 17-1.4-1.4"></path>
            <path d="m19.1 4.9-1.4 1.4"></path>
            <path d="M22 12h-2"></path>
            <path d="M2 12h2"></path>
            <path d="m4.9 19.1 1.4-1.4"></path>
            <path d="m4.9 4.9 1.4 1.4"></path>
          </svg>
          <span className="font-space">Behavioral Predictive Agent</span>
        </div>
        <div className="col-span-1 md:col-span-6 md:pl-4 md:border-l text-sm font-normal text-neutral-400 border-neutral-800 border-b pt-6 pb-6 pl-4">
          Boosts Retention: Proactively identifies and flags high-potential distributors, enabling timely strategic support to maximize their success.
        </div>

        <div className="col-span-1 md:col-span-3 border-neutral-800 border-b pt-10 pr-4 pb-6 pl-4">
          <span className="font-medium text-red-400">Inefficient Prospecting</span>
        </div>
        <div className="col-span-1 md:col-span-3 py-6 md:px-4 border-b border-neutral-800 md:border-l flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.125rem" height="1.125rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" x2="18" y1="12" y2="12"></line>
            <line x1="6" x2="2" y1="12" y2="12"></line>
            <line x1="12" x2="12" y1="6" y2="2"></line>
            <line x1="12" x2="12" y1="22" y2="18"></line>
          </svg>
          <span className="font-space">"Sniper" Agent</span>
        </div>
        <div className="col-span-1 md:col-span-6 md:pl-4 md:border-l text-sm text-neutral-400 border-neutral-800 border-b pt-6 pb-6">
          Optimizes Prospecting: Monitors social networks to find high-quality leads with buying intent, turning outreach into effective connections.
        </div>

        <div className="col-span-1 md:col-span-3 border-neutral-800 border-b pt-10 pr-4 pb-6 pl-4">
          <span className="text-red-400 font-medium">Regulatory Risk</span>
        </div>
        <div className="col-span-1 md:col-span-3 md:px-4 md:border-l flex gap-3 border-neutral-800 border-b pt-6 pb-6 gap-x-3 gap-y-3 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.375rem" height="1.375rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <span className="font-space">Content & Compliance Agent</span>
        </div>
        <div className="col-span-1 md:col-span-6 md:pl-4 md:border-l text-sm text-neutral-400 border-neutral-800 border-b pt-6 pb-6">
          Guarantees Integrity: Audits content for 100% regulatory and ethical compliance. It serves as your team's "Shield of Trust."
        </div>

        <div className="col-span-1 md:col-span-3 border-neutral-800 border-b pt-10 pr-4 pb-6 pl-4">
          <span className="font-medium text-red-400">Team Task Management</span>
        </div>
        <div className="col-span-1 md:col-span-3 md:px-4 md:border-l flex gap-3 border-neutral-800 border-b pt-6 pb-6 gap-x-3 gap-y-3 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
          </svg>
          <span className="font-space">Project & Community Manager Agent</span>
        </div>
        <div className="col-span-1 md:col-span-6 md:pl-4 md:border-l text-sm text-neutral-400 border-neutral-800 border-b pt-6 pb-6">
          Maximizes Productivity: Automatically assigns and tracks key tasks based on insights, optimizing team focus for maximum impact.
        </div>

        <div className="col-span-1 md:col-span-3 border-neutral-800 border-b pt-10 pr-4 pb-6 pl-4">
          <span className="font-medium text-red-400">Commercial Strategy and Campaigns</span>
        </div>
        <div className="col-span-1 md:col-span-3 md:px-4 md:border-l flex gap-3 border-neutral-800 border-b pt-6 pb-6 gap-x-3 gap-y-3 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="2.875rem" height="2.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="18" y1="20" y2="10"></line>
            <line x1="12" x2="12" y1="20" y2="4"></line>
            <line x1="6" x2="6" y1="20" y2="14"></line>
          </svg>
          <span className="font-space">Market Research and Social Media Content Creation Agent</span>
        </div>
        <div className="col-span-1 md:col-span-6 md:pl-4 md:border-l text-sm text-neutral-400 border-neutral-800 border-b pt-6 pb-6">
          Drives Visibility: Executes market analysis and generates strategic content, positioning your team as the industry expert.
        </div>

        <div className="col-span-1 md:col-span-3 pt-10 pr-4 pb-6 pl-4 border-neutral-800 border-b">
          <span className="font-medium text-red-400">Training, Capacity Building, and Conversation</span>
        </div>
        <div className="col-span-1 md:col-span-3 md:px-4 md:border-l flex gap-3 border-neutral-800 pt-6 pb-6 gap-x-3 gap-y-3 items-center border-b">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.375rem" height="1.375rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className="font-space">"Commercial Backoffice" Agent</span>
        </div>
        <div className="col-span-1 md:col-span-6 md:pl-4 md:border-l text-sm text-neutral-400 border-neutral-800 pt-6 pb-6">
          Empowers Team Knowledge: Acts as the central intelligence hub, ensuring fast, precise information exchange for immediate team success.
        </div>
      </div>
    </div>
  )
}

