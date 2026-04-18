import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { randomDraw, weightedDraw, calculateMatches, calculatePrizes } from '@/lib/drawEngine'
import { redirect } from 'next/navigation'

export default async function AdminDraw() {
  const { data: draws } = await supabaseAdmin.from('draws').select('*').order('created_at', { ascending: false }).limit(10)
  const { data: latestDraw } = await supabaseAdmin.from('draws').select('*').eq('status', 'simulated').order('created_at', { ascending: false }).limit(1).single().catch(() => ({ data: null }))

  // Get subscriber count for prize pool calculation
  const { count: activeSubs } = await supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { data: plans } = await supabaseAdmin.from('subscriptions').select('plan').eq('status', 'active')
  const monthlyFee = plans?.reduce((sum, s) => sum + (s.plan === 'yearly' ? 100 / 12 : 10), 0) || 0

  async function runSimulation(formData: FormData) {
    'use server'
    const drawType = formData.get('drawType') as 'random' | 'weighted'
    
    let winningNumbers: number[]
    if (drawType === 'weighted') {
      const { data: scores } = await supabaseAdmin.from('scores').select('score')
      const allScores = scores?.map(s => s.score) || []
      winningNumbers = weightedDraw(allScores)
    } else {
      winningNumbers = randomDraw()
    }

    const plans = await supabaseAdmin.from('subscriptions').select('plan').eq('status', 'active')
    const monthlyFee = plans.data?.reduce((sum, s) => sum + (s.plan === 'yearly' ? 100 / 12 : 10), 0) || 0
    const activeSubs = plans.data?.length || 0

    const prizes = calculatePrizes({ winning_numbers: winningNumbers } as any, activeSubs, monthlyFee)

    const month = new Date()
    month.setDate(1)
    month.setHours(0, 0, 0, 0)

    await supabaseAdmin.from('draws').insert({
      month: month.toISOString(),
      status: 'simulated',
      draw_type: drawType,
      winning_numbers: winningNumbers,
      jackpot_amount: prizes.jackpot,
      pool_4match: prizes.pool4match,
      pool_3match: prizes.pool3match,
    })

    revalidatePath('/admin/draw')
  }

  async function publishDraw(formData: FormData) {
    'use server'
    const drawId = formData.get('drawId') as string
    
    // Fetch draw + all entries
    const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', drawId).single()
    const { data: entries } = await supabaseAdmin.from('draw_entries').select('*, scores!inner(score)').eq('draw_id', drawId)
    
    // If no entries, match against users' current scores
    const { data: userScores } = await supabaseAdmin.from('scores').select('user_id, score')
    
    // Group scores by user
    const byUser: Record<string, number[]> = {}
    userScores?.forEach(s => {
      if (!byUser[s.user_id]) byUser[s.user_id] = []
      byUser[s.user_id].push(s.score)
    })

    const winnerInserts: any[] = []
    
    for (const [userId, userNums] of Object.entries(byUser)) {
      const matchCount = calculateMatches(draw!.winning_numbers, userNums)
      if (matchCount >= 3) {
        const matchType = `${matchCount}match` as '5match' | '4match' | '3match'
        const prizeAmount = matchType === '5match' ? draw!.jackpot_amount :
                           matchType === '4match' ? draw!.pool_4match :
                           draw!.pool_3match
        winnerInserts.push({
          draw_id: drawId,
          user_id: userId,
          match_type: matchType,
          prize_amount: prizeAmount,
          status: 'pending',
        })
      }
    }

    if (winnerInserts.length > 0) {
      await supabaseAdmin.from('winners').insert(winnerInserts)
    }

    await supabaseAdmin.from('draws').update({ status: 'published' }).eq('id', drawId)
    redirect('/admin/winners')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Draw Management</h1>
        <p className="text-slate-500 mt-1">Simulate, preview, and publish monthly draws.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Run New Simulation</h2>
          <p className="text-slate-500 text-sm mb-6">Active subscribers: <span className="text-white font-semibold">{activeSubs || 0}</span> · Monthly pool: <span className="text-emerald-400 font-semibold">£{monthlyFee.toFixed(2)}</span></p>
          
          <form action={runSimulation} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Draw Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="drawType" value="random" defaultChecked className="accent-rose-500" />
                  <span className="text-white text-sm font-medium">Pure Random</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="drawType" value="weighted" className="accent-rose-500" />
                  <span className="text-white text-sm font-medium">Weighted by Score Frequency</span>
                </label>
              </div>
            </div>
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors">
              Run Simulation
            </button>
          </form>
        </div>

        {/* Simulated Result Preview */}
        {latestDraw && (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Simulated — Ready to Publish</h2>
                <p className="text-slate-500 text-sm">Type: {latestDraw.draw_type} · {new Date(latestDraw.created_at).toLocaleString()}</p>
              </div>
              <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full uppercase">Pending</span>
            </div>

            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercasefont-bold tracking-widest mb-3">Winning Numbers</p>
              <div className="flex space-x-3">
                {latestDraw.winning_numbers?.map((n: number) => (
                  <div key={n} className="w-12 h-12 bg-indigo-900/50 border border-indigo-500/40 rounded-xl flex items-center justify-center font-extrabold text-lg text-indigo-200">{n}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Jackpot (5-match)</div>
                <div className="text-emerald-400 font-bold text-sm">£{Number(latestDraw.jackpot_amount).toFixed(2)}</div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">4-match Pool</div>
                <div className="text-indigo-300 font-bold text-sm">£{Number(latestDraw.pool_4match).toFixed(2)}</div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">3-match Pool</div>
                <div className="text-slate-300 font-bold text-sm">£{Number(latestDraw.pool_3match).toFixed(2)}</div>
              </div>
            </div>

            <form action={publishDraw}>
              <input type="hidden" name="drawId" value={latestDraw.id} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
                Publish Draw & Generate Winners
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Draw History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Draw History</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Numbers</th>
                <th className="px-6 py-4">Jackpot</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {draws?.map((d: any) => (
                <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 text-slate-300">{new Date(d.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-slate-500 capitalize">{d.draw_type}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      {d.winning_numbers?.map((n: number) => (
                        <span key={n} className="w-6 h-6 bg-slate-800 rounded text-xs flex items-center justify-center font-bold text-slate-300">{n}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">£{Number(d.jackpot_amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${d.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
