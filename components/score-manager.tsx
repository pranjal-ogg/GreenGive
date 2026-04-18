'use client'

import { useState } from 'react'
import { addScore, updateScore, deleteScore } from '@/app/(dashboard)/actions'

type Score = {
  id: string
  score: number
  date: string
}

export default function ScoreManager({ initialScores }: { initialScores: Score[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [editId, setEditId] = useState<string | null>(null)
  const [scoreVal, setScoreVal] = useState('')
  const [dateVal, setDateVal] = useState('')

  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const s = parseInt(scoreVal, 10)
    if (isNaN(s) || s < 1 || s > 45) {
      setError('Score must be between 1 and 45. (Stableford format)')
      setLoading(false)
      return
    }

    if (!editId) {
      // Inline validation: show error if date already has a score
      if (initialScores.find(x => x.date === dateVal)) {
        setError('A score for this date already exists. Please select it below to edit.')
        setLoading(false)
        return
      }
    }

    const formData = new FormData()
    formData.append('score', scoreVal)
    formData.append('date', dateVal)
    
    if (editId) {
      formData.append('id', editId)
      const res = await updateScore(formData)
      if (res?.error) setError(res.error)
      else {
        setEditId(null)
        setScoreVal('')
        setDateVal('')
      }
    } else {
      const res = await addScore(formData)
      if (res?.error) setError(res.error)
      else {
        setScoreVal('')
        setDateVal('')
        if (res?.replaced) {
          showToast('Your oldest score was replaced to maintain the 5-score limit.')
        }
      }
    }
    
    setLoading(false)
  }

  const handleEdit = (s: Score) => {
    setEditId(s.id)
    setScoreVal(s.score.toString())
    setDateVal(s.date)
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setScoreVal('')
    setDateVal('')
    setError(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this score?')) {
      await deleteScore(id)
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-5 py-3 rounded-lg shadow-xl border border-slate-700 animate-pulse transition-all">
          ✨ {toast}
        </div>
      )}

      {/* Entry Form */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-white mb-4">
          {editId ? 'Edit Score' : 'Submit New Score'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-slate-300 mb-1">Score (1-45)</label>
            <input 
              type="number" 
              min="1" max="45" 
              value={scoreVal} 
              onChange={e => setScoreVal(e.target.value)}
              required
              className="w-full rounded-md border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
            <input 
              type="date" 
              value={dateVal}
              onChange={e => setDateVal(e.target.value)}
              required
              className="w-full rounded-md border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="w-full sm:w-1/3 flex gap-2 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : (editId ? 'Update' : 'Add')}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="mt-3 text-sm font-medium text-red-400">{error}</p>}
      </div>

      {/* List / Cards */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Your Recent Scores ({initialScores.length}/5)</h3>
        {initialScores.length === 0 ? (
          <p className="text-sm text-slate-400">No scores recorded yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialScores.map(score => (
              <div key={score.id} className="rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-slate-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-white">{score.score}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">Pts</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400 font-medium">
                    {new Date(score.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-700/50 flex gap-4">
                  <button onClick={() => handleEdit(score)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(score.id)} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
