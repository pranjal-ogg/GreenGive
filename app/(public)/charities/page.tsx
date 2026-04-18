import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Charity } from '@/lib/types'

export default async function CharitiesPage({ searchParams }: { searchParams: { q?: string, category?: string } }) {
  const supabase = createClient()
  
  let query = supabase.from('charities').select('*')
  
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)
  if (searchParams.category) query = query.eq('category', searchParams.category)
  
  const { data: charities } = await query
  const typedCharities = charities as Charity[] | null

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
           <div>
             <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Charity Directory</h1>
             <p className="mt-2 text-lg text-slate-600">Discover incredible organizations making a global impact.</p>
           </div>
           
           <form className="mt-6 md:mt-0 flex space-x-2" method="GET">
             <input type="text" name="q" placeholder="Search charities..." defaultValue={searchParams.q} className="rounded-lg border-gray-300 py-2 px-4 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-slate-900" />
             <input type="text" name="category" placeholder="Category" defaultValue={searchParams.category} className="rounded-lg border-gray-300 py-2 px-4 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-slate-900 w-32" />
             <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors">Filter</button>
             {(searchParams.q || searchParams.category) && <Link href="/charities" className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors">Clear</Link>}
           </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {typedCharities && typedCharities.length > 0 ? (
             typedCharities.map((c) => (
                <Link href={`/charities/${c.id}`} key={c.id} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 transition-all overflow-hidden cursor-pointer h-full">
                  <div className="h-48 w-full bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    {c.image_url ? (
                      <Image src={c.image_url} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold tracking-widest uppercase">No Image</div>
                    )}
                    {c.featured && (
                      <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">Featured</span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    {c.category && <span className="text-emerald-600 text-xs font-semibold mb-2 uppercase tracking-wide">{c.category}</span>}
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{c.name}</h3>
                    <p className="text-slate-600 line-clamp-3 text-sm flex-grow">{c.description}</p>
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center text-emerald-600 text-sm font-semibold group-hover:text-emerald-500 transition-colors">
                      View full profile <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
             ))
           ) : (
             <div className="col-span-3 py-20 text-center text-slate-500">
                No charities found matching your criteria.
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
