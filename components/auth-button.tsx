"use client"

import { useState } from "react"
import { SignInPopup } from "./signin-popup"

const colors = {
  textPrimary: '#FFFFFF',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
}

export function AuthButton() {
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsSignInOpen(true)}
        className="uppercase hover:opacity-80 transition-all flex text-xs font-semibold tracking-wider rounded-full py-2 px-4 md:px-5 gap-2 items-center backdrop-blur flex-shrink-0 active:scale-95" 
        style={{
          color: colors.textPrimary,
          border: `1px solid ${colors.cardBorder}`,
          background: `${colors.textPrimary}0D`,
          touchAction: 'manipulation',
        }}
      >
        <span className="hidden sm:inline pointer-events-none">Войти</span>
        <span className="sm:hidden pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="hidden sm:block pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>

      <SignInPopup isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  )
}

