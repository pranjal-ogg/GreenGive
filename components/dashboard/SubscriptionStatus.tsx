'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Subscription } from '@/lib/types'

export default function SubscriptionStatus({ subscription }: { subscription: Subscription | null }) {
  if (!subscription) return null
  
  const statusColors = subscription.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  const planName = subscription.plan === 'yearly' ? 'Yearly Access' : 'Monthly Access'
  const renewal = subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full relative overflow-hidden"
    >
       <div className="relative z-10">
         <div className="flex justify-between items-start mb-6">
           <div>
             <h3 className="text-xl font-bold text-white mb-1">Subscription</h3>
             <p className="text-slate-400 text-sm">Empowering charities globally</p>
           </div>
           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors}`}>
             {subscription.status}
           </span>
         </div>
         
         <div className="space-y-4 mt-6">
           <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
             <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Plan</span>
             <span className="text-white font-semibold">{planName}</span>
           </div>
           <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
             <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Renews</span>
             <span className="text-white font-semibold">{renewal}</span>
           </div>
         </div>
       </div>

       <Link href="/subscribe" className="mt-8 w-full block text-center py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-white rounded-xl font-medium transition-colors text-sm relative z-10">
         Manage Plan
       </Link>
    </motion.div>
  )
}
