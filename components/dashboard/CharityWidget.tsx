'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Charity } from '@/lib/types'

interface CharityAllocation {
  contribution_pct: number
  charities: Charity | null
}

export default function CharityWidget({ allocation }: { allocation: CharityAllocation | null }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col"
    >
       <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
       <h3 className="text-xl font-bold text-white mb-1">Your Impact</h3>
       <p className="text-indigo-200/70 text-sm mb-6">Directly funding change</p>

       <div className="flex-grow flex flex-col justify-center">
         {allocation ? (
           <>
             <div className="flex items-center space-x-4 mb-6 relative z-10">
               <div className="w-16 h-16 rounded-2xl bg-indigo-950 flex shadow-inner items-center justify-center overflow-hidden border border-indigo-500/50 border-dashed shrink-0 relative">
                 {allocation.charities?.image_url ? (
                   <Image 
                     src={allocation.charities.image_url} 
                     alt={allocation.charities.name || 'Charity'}
                     fill
                     className="object-cover" 
                   />
                 ) : (
                   <span className="text-indigo-400 font-bold text-xl">{allocation.charities?.name.charAt(0) || '?'}</span>
                 )}
               </div>
               <div>
                 <h4 className="text-lg font-bold text-white line-clamp-1">{allocation.charities?.name || 'Unknown'}</h4>
                 <p className="text-indigo-300 text-sm font-semibold">{allocation.contribution_pct}% of subscription goes here</p>
               </div>
             </div>
           </>
         ) : (
           <div className="mb-6 py-4 px-4 bg-indigo-950/50 rounded-xl border border-indigo-800 border-dashed text-indigo-300 text-sm text-center relative z-10">
             No charity selected yet. Update below!
           </div>
         )}
       </div>

       <Link href="/dashboard/settings" className="w-full block text-center py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-100 rounded-xl font-medium transition-colors text-sm relative z-10">
         Change Assignment
       </Link>
    </motion.div>
  )
}
