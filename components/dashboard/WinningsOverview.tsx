'use client'
import { motion } from 'framer-motion'

export default function WinningsOverview({ winnings }: { winnings: any[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col"
    >
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white">Winnings Ledger</h3>
         <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Payouts</span>
       </div>
       
       <div className="overflow-x-auto flex-grow">
         <table className="w-full text-left border-collapse min-w-[500px]">
           <thead>
             <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
               <th className="pb-3 font-semibold px-2">Draw Month</th>
               <th className="pb-3 font-semibold px-2">Match Tier</th>
               <th className="pb-3 font-semibold px-2">Prize</th>
               <th className="pb-3 font-semibold px-2 text-right">Status</th>
             </tr>
           </thead>
           <tbody className="text-sm">
             {winnings && winnings.length > 0 ? (
               winnings.map((win) => (
                 <tr key={win.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                   <td className="py-4 px-2 text-slate-300 font-medium">
                     {win.draws?.month ? new Date(win.draws.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric'}) : 'Unknown'}
                   </td>
                   <td className="py-4 px-2 text-indigo-300 font-semibold">{win.match_type}</td>
                   <td className="py-4 px-2 text-emerald-400 font-bold">${win.prize_amount}</td>
                   <td className="py-4 px-2 text-right">
                     <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${win.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                       {win.status}
                     </span>
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td colSpan={4}>
                   <div className="py-12 mt-4 text-center text-slate-500 bg-slate-950/50 border border-slate-800 border-dashed rounded-xl w-full flex flex-col items-center justify-center">
                     <svg className="w-8 h-8 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     No winnings recorded yet.
                     <span className="text-xs mt-1 block">Keep submitting scores to qualify!</span>
                   </div>
                 </td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
    </motion.div>
  )
}
