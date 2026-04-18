import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default async function AdminWinners() {
  const { data: winners } = await supabaseAdmin
    .from('winners')
    .select('*, users(email, full_name), draws(month)')
    .order('created_at', { ascending: false })

  async function updateWinnerStatus(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const status = formData.get('status') as string
    await supabaseAdmin.from('winners').update({ status }).eq('id', id)
    revalidatePath('/admin/winners')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Winners Management</h1>
        <p className="text-slate-500 mt-1">Review proofs, approve winners, and mark prizes as paid.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Draw Month</th>
              <th className="px-6 py-4">Match</th>
              <th className="px-6 py-4">Prize</th>
              <th className="px-6 py-4">Proof</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {winners && winners.length > 0 ? winners.map((w: any) => (
              <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{w.users?.full_name || 'Unknown'}</div>
                  <div className="text-slate-500 text-xs">{w.users?.email}</div>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {w.draws?.month ? new Date(w.draws.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '–'}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-900/30 text-indigo-400 rounded-lg text-xs font-bold">{w.match_type}</span>
                </td>
                <td className="px-6 py-4 text-emerald-400 font-bold">£{Number(w.prize_amount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  {w.proof_url ? (
                    <a href={w.proof_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline text-xs">View Proof ↗</a>
                  ) : (
                    <span className="text-slate-600 text-xs italic">No proof uploaded</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                    w.status === 'verified' ? 'bg-indigo-500/10 text-indigo-400' :
                    w.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>{w.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end space-x-2">
                    {w.status === 'pending' && (
                      <>
                        <form action={updateWinnerStatus}>
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="status" value="verified" />
                          <button type="submit" className="px-3 py-1.5 bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900/70 rounded-lg text-xs font-bold transition-colors">Approve</button>
                        </form>
                        <form action={updateWinnerStatus}>
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button type="submit" className="px-3 py-1.5 bg-rose-900/30 text-rose-400 hover:bg-rose-900/50 rounded-lg text-xs font-bold transition-colors">Reject</button>
                        </form>
                      </>
                    )}
                    {w.status === 'verified' && (
                      <form action={updateWinnerStatus}>
                        <input type="hidden" name="id" value={w.id} />
                        <input type="hidden" name="status" value="paid" />
                        <button type="submit" className="px-3 py-1.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors">Mark Paid</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-600">No winners recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
