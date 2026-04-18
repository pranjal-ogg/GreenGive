'use client'
import { motion } from 'framer-motion'
import { Score } from '@/lib/types'

export default function DrawParticipation({ scores, drawsEntered }: { scores: Score[], drawsEntered: number }) {
  const nextDraw = new Date()
  nextDraw.setMonth(nextDraw.getMonth() + 1)
  nextDraw.setDate(1)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between"
    >
       <div className="flex flex-col mb-4">
         <div className="flex justify-between items-start mb-2">
           <div>
             <h3 className="text-xl font-bold text-white mb-1">Draw Participation</h3>
             <p className="text-slate-400 text-sm">Your active ticket allocation</p>
           </div>
           <div className="text-right">
             <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Next Draw</div>
             <div className="text-indigo-400 font-bold">{nextDraw.toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</div>
           </div>
         </div>
       </div>

       <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/80 mb-6 flex-grow">
         <div className="text-xs text-slate-500 mb-4 uppercase tracking-widest font-semibold flex justify-between">
           <span>Your Numbers</span>
           <span>({scores.length}/5)</span>
         </div>
         <div className="flex space-x-2">
           {Array.from({ length: 5 }).map((_, i) => {
             const score = scores[i]
             return (
               <div key={i} className={`flex-1 aspect-[4/5] rounded-xl flex items-center justify-center font-bold text-lg md:text-xl shadow-inner border transition-all ${score ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-700 border-dashed'}`}>
                 {score ? score.score : '-'}
               </div>
             )
           })}
         </div>
         <p className="text-xs text-slate-500 mt-4 text-center leading-relaxed">Your 5 most recent scores automatically lock in as your monthly draw entries.</p>
       </div>

       <div className="flex items-center space-x-3 text-sm text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
         <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold shadow-sm">{drawsEntered}</span>
         <span className="font-medium">Lifetime draws entered on record</span>
       </div>
    </motion.div>
  )
}
