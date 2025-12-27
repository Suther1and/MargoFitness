export function Footer() {
  return (
    <footer className="md:px-12 text-neutral-400 bg-neutral-900 border-neutral-800 border-t pt-12 pr-6 pb-12 pl-6 w-full relative xl:rounded-b-[3rem] mt-[-1px] shadow-[0_0_0_1px_#171717]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-white">
            <span className="font-oswald text-lg font-medium tracking-tight uppercase">
              LINARIS
            </span>
          </div>
          <p className="text-base max-w-xs leading-relaxed">
            The catalyst for the next evolution of the MLM industry. Algorithmic
            certainty for elite leaders.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-base">
          <div className="flex flex-col gap-3">
            <span className="text-white font-medium uppercase tracking-widest text-xs">
              Platform
            </span>
            <a href="#" className="hover:text-white transition-colors">
              Agents
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Integrations
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-white font-medium uppercase tracking-widest text-xs">
              Company
            </span>
            <a href="#" className="hover:text-white transition-colors">
              About Us
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Careers
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Legal
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-xs flex justify-between">
        <span>© 2026 LINARIS.io. All rights reserved.</span>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  )
}

