import { createClient } from '@/lib/supabase/server'
import CharitySelector from '@/components/charity-selector'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: charities } = await supabase.from('charities').select('*')
  
  const { data: activeAllocation } = await supabase
    .from('user_charities')
    .select('*, charities(name)')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
      
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-lg">
         <h2 className="text-xl font-bold text-white mb-2">Active Charity Allocation</h2>
         {activeAllocation ? (
           <p className="text-slate-400 mb-8">
             You are currently dedicating <span className="font-bold text-emerald-400">{activeAllocation.contribution_pct}%</span> of your subscription to <span className="font-bold text-emerald-400">{activeAllocation.charities.name}</span>. Use the panel below to swap allocations anytime!
           </p>
         ) : (
           <p className="text-slate-400 mb-8">You haven't designated a primary charity yet. Please do so below!</p>
         )}

         <CharitySelector charities={charities || []} />
      </div>
    </div>
  )
}
