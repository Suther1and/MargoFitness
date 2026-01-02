import { Inter, Oswald } from 'next/font/google'
import { getCurrentProfile } from '@/lib/actions/profile'
import { redirect } from 'next/navigation'
import { AdminStyles } from './admin-styles'

const oswald = Oswald({ 
  subsets: ['latin', 'cyrillic'], 
  variable: '--font-oswald', 
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'], 
  variable: '--font-inter', 
  display: 'swap',
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className={`${oswald.variable} ${inter.variable} font-inter min-h-screen`}>
      <AdminStyles />
      <div className="relative w-full">
        <div className="px-4 md:px-8 pb-12">
          {children}
        </div>
      </div>
    </div>
  )
}

