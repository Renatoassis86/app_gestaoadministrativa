import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MarketingSidebar from '@/components/marketing/MarketingSidebar'
import type { Profile } from '@/types/database'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/marketing')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (profile && !profile.is_active) redirect('/login?error=inactive')

  return (
    <div className="flex">
      <MarketingSidebar profile={profile} />
      <div
        className="dashboard-content"
        style={{ marginLeft: 'var(--sidebar-w)', flex: 1, minWidth: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </div>
    </div>
  )
}
