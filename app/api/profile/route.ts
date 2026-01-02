import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ profile: null }, { status: 200 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[API Profile] Error:', error)
      return NextResponse.json({ profile: null, error: error.message }, { status: 200 })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('[API Profile] Exception:', err)
    return NextResponse.json({ profile: null, error: 'Internal error' }, { status: 500 })
  }
}

