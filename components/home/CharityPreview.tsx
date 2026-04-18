'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export default function CharityPreview({ charities }: { charities: any[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-28 px-6 bg-[#080B14]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Choose your cause</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 tracking-tight">
              Who benefits<br />from your game
            </h2>
          </div>
          <Link href="/charities" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center space-x-2 shrink-0">
            <span>View all charities</span>
            <span>→</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {charities.length > 0 ? charities.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <Link
                href={`/charities/${c.id}`}
                className="group flex flex-col bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] h-full"
              >
                <div className="h-48 bg-slate-800 overflow-hidden relative">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-5xl">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  {c.featured && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  {c.category && <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-2">{c.category}</span>}
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">{c.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed flex-grow">{c.description}</p>
                  <div className="mt-5 pt-5 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-600 text-xs">Support this cause</span>
                    <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors text-sm">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-72 animate-pulse" />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
