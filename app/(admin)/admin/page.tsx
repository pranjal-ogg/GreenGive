import { supabaseAdmin } from '@/lib/supabase/admin'
import { Draw } from '@/lib/types'

export default async function AdminReports() {
  const [
    { count: activeSubs },
    { data: draws },
    { data: contributions },
  ] = await Promise.all([
    supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('draws').select('*').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('charity_contributions').select('amount'),
  ])

  const typedDraws = draws as Draw[] | null

  // Calculate monthly prize pool: count active monthly subs × £10 + yearly/12 × £100
  const { data: activePlans } = await supabaseAdmin.from('subscriptions').select('plan').eq('status', 'active')
  const monthlyFee = activePlans?.reduce((sum, s) => sum + (s.plan === 'yearly' ? 100 / 12 : 10), 0) || 0
  const totalContributions = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0

  const statCards = [
    { label: 'Active Subscribers', value: activeSubs ?? 0, color: 'indigo', icon: '👥' },
    { label: 'Monthly Prize Pool', value: `£${monthlyFee.toFixed(2)}`, color: 'emerald', icon: '💰' },
    { label: 'Total Charity Contributions', value: `£${totalContributions.toFixed(2)}`, color: 'rose', icon: '💚' },
    { label: 'Total Draws Run', value: typedDraws?.length ?? 0, color: 'amber', icon: '🎰' },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'border-indigo-500/30 bg-indigo-900/20 text-indigo-300',
    emerald: 'border-emerald-500/30 bg-emerald-900/20 text-emerald-300',
    rose: 'border-rose-500/30 bg-rose-900/20 text-rose-300',
    amber: 'border-amber-500/30 bg-amber-900/20 text-amber-300',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Platform health overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border p-6 shadow-lg ${colorMap[card.color]}`}>
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-4xl font-extrabold text-white mb-1">{card.value}</div>
            <div className="text-sm font-medium opacity-80">{card.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Draw History</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Winning Numbers</th>
                <th className="px-6 py-4">Jackpot</th>
              </tr>
            </thead>
            <tbody>
              {typedDraws && typedDraws.length > 0 ? typedDraws.map((d) => (
                <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-slate-300 font-medium">{new Date(d.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-slate-400 capitalize">{d.draw_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${d.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      {(d.winning_numbers || []).map((n) => (
                        <span key={n} className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-white">{n}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{d.jackpot_amount ? `£${Number(d.jackpot_amount).toFixed(2)}` : '–'}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-600">No draws yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
