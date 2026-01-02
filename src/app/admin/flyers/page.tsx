
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Play, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ProcessButton } from '@/app/admin/flyers/process-button'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function FlyersPage() {
    const supabase = await createClient()

    // Fetch flyers with market name
    const { data: flyers } = await supabase
        .from('flyers')
        .select(`
      *,
      markets (name)
    `)
        .order('upload_date', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Encartes (Flyers)</h1>
                <Button asChild>
                    <Link href="/admin/flyers/new">
                        <Plus className="mr-2 h-4 w-4" /> Novo Encarte
                    </Link>
                </Button>
            </div>

            <div className="rounded-lg border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Mercado</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Validade</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {flyers?.map((flyer) => (
                            <TableRow key={flyer.id}>
                                <TableCell>
                                    {format(new Date(flyer.upload_date), 'dd/MM/yyyy HH:mm')}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {flyer.markets?.name}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={flyer.status} />
                                </TableCell>
                                <TableCell>
                                    {flyer.valid_until
                                        ? format(new Date(flyer.valid_until), 'dd/MM/yyyy')
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <ProcessButton
                                        flyerId={flyer.id}
                                        status={flyer.status}
                                    />
                                    {/* View Details button could go here */}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!flyers || flyers.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Nenhum encarte cadastrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        received: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        processing: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        review_needed: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        published: 'bg-green-100 text-green-800 hover:bg-green-100',
        failed: 'bg-red-100 text-red-800 hover:bg-red-100',
    }

    const labels = {
        received: 'Recebido',
        processing: 'Processando',
        review_needed: 'Revisão',
        published: 'Publicado',
        failed: 'Falhou',
    }

    // @ts-ignore
    return <Badge className={styles[status] || ''} variant="outline">{labels[status] || status}</Badge>
}
