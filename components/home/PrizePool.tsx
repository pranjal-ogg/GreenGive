'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const pools = [
  { label: '5-Match Jackpot', pct: 40, color: 'from-amber-400 to-orange-500', textColor: 'text-amber-400', desc: 'Rolls over monthly until claimed', icon: '🏆' },
  { label: '4-Match Prize', pct: 35, color: 'from-indigo-400 to-purple-500', textColor: 'text-indigo-400', desc: 'Split equally among all 4-match winners', icon: '🥈' },
  { label: '3-Match Prize', pct: 25, color: 'from-teal-400 to-emerald-500', textColor: 'text-teal-400', desc: 'Split equally among all 3-match winners', icon: '🥉' },
]

export default function PrizePool() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-28 px-6 bg-[#0C1121]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Transparent prizes</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 tracking-tight">
            How the prize pool works
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">
            Every penny of every subscription contributes. The pool is split across three match tiers — the jackpot rolls over if unclaimed.
          </p>
        </motion.div>

        <div className="space-y-6">
          {pools.map((pool, i) => (
            <motion.div
              key={pool.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{pool.icon}</span>
                  <div>
                    <h3 className={`text-lg font-bold ${pool.textColor}`}>{pool.label}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{pool.desc}</p>
                  </div>
                </div>
                <span className={`text-4xl font-black ${pool.textColor}`}>{pool.pct}%</span>
              </div>

              {/* Animated bar */}
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${pool.color}`}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${pool.pct}%` } : { width: 0 }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 border-dashed flex items-start space-x-4"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-900/60 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            The total prize pool grows with every new subscriber. Pool amounts are calculated from active subscriber fees each month and displayed transparently in your dashboard.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
