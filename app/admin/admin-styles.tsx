'use client'

export function AdminStyles() {
  return (
    <style jsx global>{`
      .font-oswald { font-family: var(--font-oswald); }
      .font-inter { font-family: var(--font-inter); }
      
      @keyframes shimmer {
        0% { transform: translate3d(-100%, 0, 0); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translate3d(200%, 0, 0); opacity: 0; }
      }
      
      .animate-shimmer {
        animation: shimmer 2.5s infinite !important;
      }

      @keyframes pulseGlow {
        0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 1.5px 0.75px rgba(74, 222, 128, 0.45); }
        50% { opacity: 0.75; transform: scale(1.28); box-shadow: 0 0 6px 2px rgba(74, 222, 128, 0.675); }
      }
      
      .animate-pulse-glow {
        animation: pulseGlow 2s ease-in-out infinite !important;
      }
    `}</style>
  )
}



