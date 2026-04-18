import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Charity } from '@/lib/types'

interface CharityEvent {
  date: string
  title: string
  location: string
}

export default async function CharityProfile({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: charity } = await supabase.from('charities').select('*').eq('id', params.id).single()
  const typedCharity = charity as Charity | null
  
  if (!typedCharity) notFound()

  const events = (typedCharity.events as unknown as CharityEvent[]) || []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
       <div className="w-full h-80 relative overflow-hidden bg-slate-900">
         {typedCharity.image_url && (
            <Image 
              src={typedCharity.image_url} 
              alt={typedCharity.name} 
              fill 
              className="object-cover opacity-60" 
              priority
            />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
         <div className="absolute bottom-10 left-10 md:left-24 max-w-4xl z-10">
           {typedCharity.category && <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm mb-4 inline-block">{typedCharity.category}</span>}
           {typedCharity.featured && <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm mb-4 ml-2 inline-block">Featured</span>}
           <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">{typedCharity.name}</h1>
           {typedCharity.website && (
              <a href={typedCharity.website} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold mt-4 block">
                {typedCharity.website} ↗
              </a>
           )}
         </div>
       </div>

       <div className="max-w-4xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold border-b pb-4 mb-6 text-slate-800">Our Mission</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg">
              {typedCharity.description?.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line}</p>
              ))}
            </div>

            <div className="mt-16 bg-emerald-50 rounded-2xl p-8 border border-emerald-100 shadow-sm">
               <h3 className="text-xl font-bold text-emerald-900 mb-2">Want to support {typedCharity.name}?</h3>
               <p className="text-emerald-700 text-sm mb-6">Sign up to our subscription pool and assign this charity as your direct beneficiary! A percentage of your active payouts will bridge straight to their active funds.</p>
               <Link href="/signup" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition">Join Platform directly</Link>
               {typedCharity.website && (
                  <a href={typedCharity.website} target="_blank" rel="noopener noreferrer" className="ml-4 text-emerald-600 font-semibold hover:text-emerald-500 underline">Donate externally Instead</a>
               )}
            </div>
          </div>

          <div className="md:col-span-1 border-l pl-0 md:pl-12 border-slate-200">
             <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
               <svg className="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
               Upcoming Golf Events
             </h2>
             
             {events.length > 0 ? (
                <div className="space-y-6">
                  {events.map((ev, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors">
                      <div className="text-xs text-emerald-600 font-bold tracking-wide uppercase">{new Date(ev.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}</div>
                      <h4 className="font-bold text-slate-800 mt-1">{ev.title}</h4>
                      <p className="text-sm text-slate-500 mt-2 flex items-start">
                         <svg className="w-4 h-4 mr-1 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         {ev.location}
                      </p>
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-slate-500 text-sm italic border p-4 rounded-xl border-dashed">No upcoming events scheduled.</p>
             )}
          </div>
       </div>
    </div>
  )
}
