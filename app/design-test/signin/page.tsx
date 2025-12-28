"use client"

import { useState } from "react"
import { SignInPopup } from "@/components/signin-popup"

export default function SignInDesignTest() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 rounded-full text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95"
          style={{ 
            background: 'linear-gradient(to right, #f97316, #ea580c)',
            boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)'
          }}
        >
          Открыть Sign In
        </button>
      </div>

      <SignInPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

