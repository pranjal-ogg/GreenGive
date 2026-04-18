import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export default async function AdminUsers({ searchParams }: { searchParams: { q?: string } }) {
  let query = supabaseAdmin
    .from('users')
    .select('*, subscriptions(plan, status, current_period_end)')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('email', `%${searchParams.q}%`)
  }

  const { data: users } = await query

  async function suspendUser(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    const isSuspended = formData.get('isSuspended') === 'true'
    // We use 'suspended' role to lock them out
    await supabaseAdmin.from('users').update({ role: isSuspended ? 'user' : 'suspended' }).eq('id', userId)
    revalidatePath('/admin/users')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Search, view, and manage all platform users.</p>
        </div>
        <form method="GET" className="flex space-x-2">
          <input
            type="text"
            name="q"
            placeholder="Search by email..."
            defaultValue={searchParams.q}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 w-64"
          />
          <button type="submit" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-colors">Search</button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Sub Status</th>
              <th className="px-6 py-4">Renews</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? users.map((u: any) => {
              const sub = u.subscriptions?.[0]
              const isSuspended = u.role === 'suspended'
              return (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{u.full_name || 'Unnamed'}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-400' : isSuspended ? 'bg-slate-700 text-slate-400' : 'bg-slate-800 text-slate-400'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{sub?.plan || '–'}</td>
                  <td className="px-6 py-4">
                    {sub ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{sub.status}</span>
                    ) : <span className="text-slate-600 text-xs">No subscription</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '–'}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={suspendUser} className="inline">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="isSuspended" value={isSuspended.toString()} />
                      <button type="submit" className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isSuspended ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50'}`}>
                        {isSuspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    </form>
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-600">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
