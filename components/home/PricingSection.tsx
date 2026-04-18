'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '10',
    period: '/mo',
    description: 'Perfect for trying it out.',
    features: [
      'Enter every monthly draw',
      'Submit up to 5 scores',
      'Choose your charity',
      'Full dashboard access',
      'Cancel anytime',
    ],
    highlight: false,
    cta: 'Start Monthly',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '100',
    period: '/yr',
    description: 'Save 16% — best value.',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority draw participation',
      'Early access to new features',
      'Dedicated support',
    ],
    highlight: true,
    cta: 'Start Yearly — Best Value',
  },
]

export default function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (plan: string) => {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (res.status === 401) {
        router.push('/signup')
        return
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section ref={ref} className="py-28 px-6 bg-[#0C1121]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Simple pricing</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 tracking-tight">
            Choose your plan
          </h2>
          <p className="text-slate-500 mt-4 max-w-md mx-auto">
            Cancel anytime. No setup fees. Every plan includes full draw entry and charity contributions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-900/40 to-slate-900 border-2 border-indigo-500/60 shadow-[0_0_60px_rgba(99,102,241,0.15)]'
                  : 'bg-slate-900 border border-slate-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-400 mb-1">{plan.name}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-white">£{plan.price}</span>
                  <span className="text-slate-500 font-medium">{plan.period}</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3 text-sm">
                    <svg className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {loadingPlan === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
