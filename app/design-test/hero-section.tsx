export function HeroSection() {
  return (
    <section className="md:px-12 md:pb-10 w-full pt-12 pr-6 pb-24 pl-6 relative bg-zinc-100 xl:rounded-t-[3rem]">
      <div className="max-w-7xl mx-auto flex flex-col gap-x-12 gap-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-16 gap-x-0 gap-y-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-x-8 gap-y-8">
            <div className="flex gap-4 gap-x-4 gap-y-4 items-center">
              <div className="h-px w-12 bg-neutral-400"></div>
              <span className="uppercase text-sm font-medium text-neutral-500 tracking-widest">
                AI-First Operating System FOR MLM
              </span>
            </div>

            <h1 className="md:text-8xl lg:text-9xl leading-[0.85] uppercase text-6xl font-medium text-neutral-900 tracking-tight font-oswald pt-8 pb-6">
              Leadership for the
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-600 to-neutral-900">
                {' '}Agentic AI Era
              </span>
            </h1>
          </div>

          <div className="lg:col-span-5 group h-full mt-1 relative">
            <div className="absolute inset-0 bg-neutral-900 rounded-2xl rotate-3 opacity-10 group-hover:rotate-6 transition-transform duration-500"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[27.5rem] lg:h-[34.375rem] w-full">
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/50040b25-162c-4f33-9ec2-1548e670a5c3_1600w.jpg"
                alt="Futuristic AI Leadership"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <div className="bg-gradient-to-t from-neutral-900/40 to-transparent absolute top-0 right-0 bottom-0 left-0"></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[0.65rem] uppercase tracking-widest font-space">
                    System Analysis
                  </span>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                </div>
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-2/3 animate-[pulse_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row mt-4 gap-x-12 gap-y-12 items-start">
          <div className="max-w-2xl">
            <h2 className="md:text-2xl leading-tight -mt-6 md:-mt-12 text-xl font-medium text-neutral-800 tracking-tight font-space mb-6">
              LINARIS is not for the masses. It's a strategic partner for the
              top 10% of leaders who understand that the future of MLM is not
              built with effort, but with intelligent systems.
            </h2>

            <div className="mt-8 flex gap-4">
              <button className="group relative px-8 py-4 bg-neutral-900 text-white rounded-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-neutral-500/20">
                <span className="z-10 flex items-center gap-2 uppercase text-sm font-semibold tracking-widest relative">
                  REQUEST ACCESS
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1rem"
                    height="1rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right group-hover:translate-x-1 transition-transform"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="w-full lg:w-5/12 ml-auto overflow-hidden bg-neutral-950 border-neutral-200 border rounded-2xl pt-6 pr-6 pl-6 relative shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="7.5rem"
                height="7.5rem"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[7.5rem] h-[7.5rem] text-orange-400"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border-neutral-100 border rounded-xl pt-4 pr-4 pb-4 pl-4">
                <div className="uppercase text-xs text-neutral-400 font-space mb-1">
                  Retention Rate
                </div>
                <div className="text-3xl font-medium text-neutral-900 font-oswald">
                  +45%
                </div>
                <div className="text-[0.6rem] text-green-600 mt-2 flex items-center gap-1">
                  <svg
                    width="0.625rem"
                    height="0.625rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="m18 15-6-6-6 6"></path>
                  </svg>
                  vs Industry Avg
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="text-xs font-space uppercase text-neutral-400 mb-1">
                  Team Churn
                </div>
                <div className="text-3xl font-oswald font-medium text-neutral-900">
                  -70%
                </div>
                <div className="text-[0.6rem] text-green-600 mt-2 flex items-center gap-1">
                  <svg
                    width="0.625rem"
                    height="0.625rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="m18 15-6-6-6 6"></path>
                  </svg>
                  AI Predicted
                </div>
              </div>
              <div className="col-span-2 text-white bg-neutral-900 rounded-xl pt-4 pr-4 pb-4 pl-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="uppercase text-xs text-orange-500 tracking-widest font-space">
                    System Status
                  </span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <div className="space-y-2 font-geist-mono text-[0.65rem] text-neutral-400">
                  <div className="flex justify-between">
                    <span>&gt; Agent "Sniper"</span>
                    <span className="text-white">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Compliance Scan</span>
                    <span className="text-white">Running</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; Churn Prediction</span>
                    <span className="text-emerald-400">98.2% Acc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

