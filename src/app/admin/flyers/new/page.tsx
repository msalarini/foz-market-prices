
import { createClient } from '@/lib/supabase/server'
import { FlyerUploadForm } from '../flyer-upload-form'

export default async function NewFlyerPage() {
    const supabase = await createClient()

    // Fetch active markets only
    const { data: markets } = await supabase
        .from('markets')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Novo Encarte</h1>
            <div className="rounded-lg border p-6 shadow-sm bg-card">
                <FlyerUploadForm markets={markets || []} />
            </div>
        </div>
    )
}
