export function Navbar() {
  return (
    <div className="sticky top-6 z-50 w-full">
      {/* Панель теперь растянута по max-w-7xl без внешних отступов контейнера */}
      <nav className="mx-auto max-w-7xl flex flex-wrap bg-stone-100/80 backdrop-blur-xl border border-white/20 pt-4 pr-8 pb-4 pl-8 relative gap-x-10 gap-y-4 items-center justify-between rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex text-white bg-neutral-900 w-9 h-9 rounded-lg relative items-center justify-center shadow-lg shadow-neutral-900/20">
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
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="uppercase leading-none text-xl font-medium tracking-tight font-oswald text-neutral-900">
              LINARIS
              <span className="text-orange-400">.io</span>
            </span>
            <span className="text-[0.55rem] uppercase text-neutral-700 tracking-widest font-space">
              MLM Agentic OS
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="uppercase hover:text-neutral-900 transition-colors text-[0.7rem] font-bold text-neutral-600 tracking-widest"
          >
            SOLUTIONS
          </a>
          <a
            href="#"
            className="uppercase hover:text-neutral-900 transition-colors text-[0.7rem] font-bold text-neutral-600 tracking-widest"
          >
            AGENTS
          </a>
          <a
            href="#"
            className="uppercase hover:text-neutral-900 transition-colors text-[0.7rem] font-bold text-neutral-600 tracking-widest"
          >
            PRICING
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 bg-white/50 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.875rem"
              height="0.875rem"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
              <path d="M2 12h20"></path>
            </svg>
            <span className="text-[0.65rem] font-bold uppercase tracking-wide">EN</span>
          </button>

          <button className="uppercase hover:bg-neutral-800 transition-all flex shadow-neutral-900/10 text-[0.65rem] font-bold text-white tracking-widest bg-neutral-900 rounded-full pt-2.5 pr-6 pb-2.5 pl-6 shadow-lg gap-x-2 items-center active:scale-95">
            <span>Sign In</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.75rem"
              height="0.75rem"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </nav>
    </div>
  )
}
