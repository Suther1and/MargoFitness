'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface TrainerCertificatePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrainerCertificatePopup({ open, onOpenChange }: TrainerCertificatePopupProps) {
  const colors = {
    background: '#0C0C11',
    primary: '#f97316',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          color: colors.textPrimary
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-2xl font-bold text-center"
            style={{ color: colors.textPrimary }}
          >
            Сертификаты тренера
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: `${colors.primary}1A`,
              border: `1px solid ${colors.primary}33`
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ color: colors.primary }}
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          </div>
          <p 
            className="text-lg mb-2"
            style={{ color: colors.textPrimary }}
          >
            Сертификаты будут добавлены в ближайшее время
          </p>
          <p 
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            Здесь будут отображены профессиональные сертификаты и достижения тренера
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

