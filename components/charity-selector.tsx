'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { selectCharity } from '@/app/actions/charity'
import { Charity } from '@/lib/types'

export default function CharitySelector({ charities }: { charities: Charity[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pct, setPct] = useState<number>(10)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await selectCharity(selectedId, pct)
      router.push('/subscribe')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-10 text-slate-800">
        {charities && charities.length > 0 ? (
          charities.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all bg-white shadow-sm hover:shadow-md ${
                selectedId === c.id ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'
              }`}
            >
              <h3 className="font-bold text-lg text-emerald-700">{c.name}</h3>
              <p className="text-slate-500 mt-2 text-sm line-clamp-2">{c.description}</p>
            </div>
          ))
        ) : (
          <div className="w-full col-span-2 text-center text-slate-500 py-10 bg-slate-800/10 rounded-xl border border-slate-700 border-dashed text-white">
            No charities populated yet! The admin will add these later.
          </div>
        )}
      </div>

      {selectedId && (
        <div className="mb-10 text-left bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl text-white">
          <label className="block text-sm font-medium leading-6 text-slate-300">
            Contribution Percentage: <span className="font-bold text-emerald-400">{pct}%</span>
          </label>
          <div className="mt-2 flex items-center justify-between space-x-4">
             <span className="text-xs text-slate-400">10%</span>
             <input
              type="range"
              min="10"
              max="100"
              value={pct}
              onChange={(e) => setPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
             />
             <span className="text-xs text-slate-400">100%</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Choose how much of your subscription translates into donation if your numbers hit.</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!selectedId || loading}
        className="w-full px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-lg transition-colors inline-block text-white disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save & Continue to Subscription'}
      </button>
    </div>
  )
}
