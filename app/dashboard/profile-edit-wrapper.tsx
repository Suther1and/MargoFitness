'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { Profile } from '@/types/database'
import { Edit } from 'lucide-react'

interface ProfileEditDialogWrapperProps {
  profile: Profile
}

export function ProfileEditDialogWrapper({ profile }: ProfileEditDialogWrapperProps) {
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Edit className="mr-2 size-4" />
        Редактировать
      </Button>

      <ProfileEditDialog
        open={open}
        onOpenChange={handleOpenChange}
        profile={profile}
        isFirstTime={isFirstTime}
      />
    </>
  )
}

