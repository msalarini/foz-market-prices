
import { createClient } from '@/lib/supabase/server'
import { MarketsTable } from '@/app/admin/markets/markets-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MarketsPage() {
    const supabase = await createClient()
    const { data: markets } = await supabase
        .from('markets')
        .select('*')
        .order('name')

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Mercados</h1>
                <Button asChild>
                    <Link href="/admin/markets/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Mercado
                    </Link>
                </Button>
            </div>
            <div className="rounded-lg border shadow-sm">
                <MarketsTable markets={markets || []} />
            </div>
        </div>
    )
}
