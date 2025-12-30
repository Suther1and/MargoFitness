'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { Profile } from '@/types/database'

interface ProfileEditDialogWrapperProps {
  profile: Profile
  children?: ReactNode
}

export function ProfileEditDialogWrapper({ profile, children }: ProfileEditDialogWrapperProps) {
  const [open, setOpen] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    // Показываем модалку автоматически при первом входе
    // Если profile_completed_at === null, значит пользователь не заполнял профиль
    if (!profile.profile_completed_at) {
      setOpen(true)
      setIsFirstTime(true)
    }
  }, [profile.profile_completed_at])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    // После закрытия модалки первого входа, больше не показываем isFirstTime
    if (!newOpen && isFirstTime) {
      setIsFirstTime(false)
    }
  }

  return (
    <>
      {children && (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      )}

      <ProfileEditDialog
        open={open}
        onOpenChange={handleOpenChange}
        profile={profile}
        isFirstTime={isFirstTime}
      />
    </>
  )
}

