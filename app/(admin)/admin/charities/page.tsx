import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import { Charity } from '@/lib/types'

export default async function AdminCharitiesPage() {
  const supabase = createClient()
  const { data: charities } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
  const typedCharities = charities as Charity[] | null

  async function addCharity(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const desc = formData.get('description') as string
    const website = formData.get('website') as string
    const featured = formData.get('featured') === 'on'
    
    let image_url = formData.get('image_url') as string
    const imageFile = formData.get('image_file') as File
    
    if (imageFile && imageFile.size > 0) {
      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`
      
      const { data, error } = await supabaseAdmin.storage.from('charities').upload(fileName, imageFile, {
        contentType: imageFile.type,
      })
      if (!error && data) {
        const { data: { publicUrl } } = supabaseAdmin.storage.from('charities').getPublicUrl(data.path)
        image_url = publicUrl
      } else {
        console.error("Storage upload failed:", error)
      }
    }

    await supabaseAdmin.from('charities').insert({ name, description: desc, website, category, featured, image_url })
    revalidatePath('/admin/charities')
  }

  async function deleteCharity(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await supabaseAdmin.from('charities').delete().eq('id', id)
    revalidatePath('/admin/charities')
  }

  async function toggleFeatured(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const currentState = formData.get('currentState') === 'true'
    await supabaseAdmin.from('charities').update({ featured: !currentState }).eq('id', id)
    revalidatePath('/admin/charities')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Charity Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-200">
        <div className="md:col-span-1">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
             <h3 className="text-xl font-bold mb-6 text-white text-center">Add New Charity</h3>
             <form action={addCharity} className="space-y-4">
                <input required type="text" name="name" placeholder="Charity Name" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:border-emerald-500 outline-none text-white" />
                <input type="text" name="category" placeholder="Category (e.g. Wildlife, Health)" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:border-emerald-500 outline-none text-white" />
                <textarea name="description" placeholder="Description" rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:border-emerald-500 outline-none text-white" />
                <input type="url" name="website" placeholder="Website URL" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 focus:border-emerald-500 outline-none text-white" />
                
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Image Source</label>
                  <input type="file" name="image_file" accept="image/*" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20" />
                  <p className="text-xs text-slate-500 mt-2 text-center">OR</p>
                  <input type="url" name="image_url" placeholder="Direct Image URL" className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 focus:border-emerald-500 outline-none text-white text-sm" />
                </div>

                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-700/50 rounded-lg">
                  <input type="checkbox" name="featured" className="w-5 h-5 accent-emerald-500 rounded bg-slate-900 border-slate-700" />
                  <span className="font-semibold text-emerald-400">Mark as Featured</span>
                </label>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg mt-4 transition-colors">Save Charity</button>
             </form>
          </div>
        </div>

        <div className="md:col-span-2">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {typedCharities?.map(c => (
               <div key={c.id} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
                 <div className="h-32 bg-slate-900 relative">
                   {c.image_url && <Image src={c.image_url} alt={c.name} fill className="object-cover" />}
                   {c.featured && <span className="absolute top-2 right-2 bg-amber-500 text-xs font-bold text-white px-2 py-1 rounded-full shadow-md z-10">Featured</span>}
                 </div>
                 <div className="p-5 flex-grow flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-white leading-tight">{c.name}</h4>
                   </div>
                   {c.category && <span className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">{c.category}</span>}
                   <p className="text-xs text-slate-400 line-clamp-3 mb-4 flex-grow">{c.description}</p>
                   
                   <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between space-x-2">
                      <form action={toggleFeatured} className="flex-1">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="currentState" value={c.featured.toString()} />
                        <button type="submit" className={`w-full text-xs font-bold py-2 rounded-lg transition-colors ${c.featured ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60'}`}>
                           {c.featured ? 'Unfeature' : 'Feature'}
                        </button>
                      </form>
                      <form action={deleteCharity}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="px-3 py-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-xs font-bold transition-colors">Delete</button>
                      </form>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  )
}
