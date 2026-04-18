'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Charity } from '@/lib/types'

function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export default function ImpactSection({
  totalContributions,
  featuredCharity,
}: {
  totalContributions: number
  featuredCharity: Charity | null
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-28 px-6 bg-gradient-to-b from-[#080B14] to-[#0C1121] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Real, measurable impact</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 tracking-tight">Impact so far</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Counter card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 rounded-3xl p-10 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-4">Total donations generated</p>
            <div className="text-6xl md:text-7xl font-black text-white leading-none mb-2">
              £<AnimatedCounter target={totalContributions} />
            </div>
            <p className="text-emerald-400 text-sm font-semibold mt-4">
              Distributed across all member-chosen charities
            </p>
          </motion.div>

          {/* Featured charity card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-colors"
          >
            {featuredCharity ? (
              <>
                <div className="h-44 bg-slate-800 overflow-hidden relative">
                  {featuredCharity.image_url ? (
                    <Image
                      src={featuredCharity.image_url}
                      alt={featuredCharity.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-5xl">
                      {featuredCharity.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg z-10">
                    Featured
                  </span>
                </div>
                <div className="p-6">
                  {featuredCharity.category && (
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{featuredCharity.category}</span>
                  )}
                  <h3 className="text-xl font-bold text-white mt-2 mb-2">{featuredCharity.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{featuredCharity.description}</p>
                  <a href={`/charities/${featuredCharity.id}`} className="mt-4 inline-flex items-center text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                    Learn more <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm p-10 text-center">
                No featured charity yet.<br />Admins can spotlight one from the dashboard.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
