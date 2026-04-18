'use client'

import { useState } from 'react'

export default function SubscribePage() {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  
  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-white bg-slate-900">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Choose Your Plan</h1>
        <p className="mt-4 text-xl text-slate-300">Join the platform to access draws, submit scores, and select charities.</p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-4xl w-full">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-semibold leading-8 text-white">Monthly Plan</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $10
              <span className="ml-1 text-xl font-medium text-slate-400">/mo</span>
            </div>
            <ul className="mt-8 space-y-4 text-slate-300">
              <li>✓ Participate in monthly draws</li>
              <li>✓ Submit up to 5 golf scores</li>
              <li>✓ Support chosen charities</li>
              <li>✓ Full dashboard access</li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={loading !== null}
            className="mt-8 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 transition-colors"
          >
            {loading === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
          </button>
        </div>

        <div className="rounded-2xl border border-emerald-500 bg-slate-800 p-8 shadow-sm ring-1 ring-emerald-500 flex flex-col justify-between relative">
          <div className="absolute -top-4 right-8 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold leading-5 text-white">
            Most popular
          </div>
          <div>
            <h3 className="text-2xl font-semibold leading-8 text-white">Yearly Plan</h3>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $100
              <span className="ml-1 text-xl font-medium text-slate-400">/yr</span>
            </div>
            <ul className="mt-8 space-y-4 text-slate-300">
              <li>✓ Participate in monthly draws</li>
              <li>✓ Submit up to 5 golf scores</li>
              <li>✓ Support chosen charities</li>
              <li>✓ Full dashboard access</li>
              <li>✓ <strong>Save 16% annually</strong></li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={loading !== null}
            className="mt-8 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 transition-colors"
          >
            {loading === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  )
}
