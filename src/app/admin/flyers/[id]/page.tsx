
import { createClient } from '@/lib/supabase/server'
import { FlyerDetailClient } from './flyer-detail-client'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function FlyerDetailPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch Flyer
    const { data: flyer } = await supabase
        .from('flyers')
        .select('*, markets(name)')
        .eq('id', id)
        .single()

    if (!flyer) return notFound()

    // Fetch Items
    const { data: items } = await supabase
        .from('flyer_items')
        .select('*')
        .eq('flyer_id', id)
        .order('clean_name', { ascending: true })

    return (
        <FlyerDetailClient
            initialFlyer={flyer}
            initialItems={items || []}
        />
    )
}
