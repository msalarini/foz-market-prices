
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CheckCircle, Save, Trash, ArrowLeft, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface FlyerItem {
    id: string
    clean_name: string | null
    raw_name: string
    price: number | null
    unit: string | null
    quantity: number | null
}

interface Flyer {
    id: string
    status: string
    markets: { name: string } | any
    valid_until: string | null
}

export function FlyerDetailClient({
    initialFlyer,
    initialItems
}: {
    initialFlyer: Flyer,
    initialItems: FlyerItem[]
}) {
    const router = useRouter()
    const [items, setItems] = useState<FlyerItem[]>(initialItems)
    const [flyer, setFlyer] = useState(initialFlyer)
    const [isLoading, setIsLoading] = useState(false)
    const [editingItem, setEditingItem] = useState<FlyerItem | null>(null)

    const supabase = createClient()

    const handlePublish = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('flyers')
                .update({ status: 'published' })
                .eq('id', flyer.id)

            if (error) throw error

            toast.success('Encarte publicado com sucesso!')
            setFlyer({ ...flyer, status: 'published' })
            router.refresh()
        } catch (e: any) {
            toast.error('Erro ao publicar: ' + e.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Tem certeza?')) return

        try {
            const { error } = await supabase.from('flyer_items').delete().eq('id', id)
            if (error) throw error

            setItems(items.filter(i => i.id !== id))
            toast.success('Item removido.')
        } catch (e: any) {
            toast.error('Erro ao remover: ' + e.message)
        }
    }

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return

        try {
            const { error } = await supabase
                .from('flyer_items')
                .update({
                    clean_name: editingItem.clean_name,
                    price: editingItem.price,
                    unit: editingItem.unit,
                })
                .eq('id', editingItem.id)

            if (error) throw error

            setItems(items.map(i => i.id === editingItem.id ? editingItem : i))
            setEditingItem(null)
            toast.success('Item atualizado.')
        } catch (e: any) {
            toast.error('Erro ao salvar: ' + e.message)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {flyer.markets?.name}
                        </h1>
                        <Badge variant="outline">{flyer.status}</Badge>
                    </div>
                    <p className="text-muted-foreground ml-12 text-sm">
                        Validade: {flyer.valid_until ? format(new Date(flyer.valid_until), 'dd/MM/yyyy') : 'N/A'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {flyer.status !== 'published' && (
                        <Button onClick={handlePublish} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Aprovar e Publicar
                        </Button>
                    )}
                </div>
            </div>

            {/* Items Grid */}
            <div className="rounded-lg border shadow-sm bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome (IA)</TableHead>
                            <TableHead>Nome Limpo (Busca)</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={item.raw_name}>
                                    {item.raw_name}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.clean_name || <span className="text-yellow-600 italic">-- Rever --</span>}
                                </TableCell>
                                <TableCell>
                                    R$ {item.price?.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {item.quantity} {item.unit}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                                        Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Nenhum item extraído ainda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Produto</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label>Nome Original</Label>
                                <Input disabled value={editingItem.raw_name} />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label>Nome Limpo (Para Busca)</Label>
                                <Input
                                    value={editingItem.clean_name || ''}
                                    onChange={e => setEditingItem({ ...editingItem, clean_name: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label>Preço (R$)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingItem.price || ''}
                                        onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label>Unidade</Label>
                                    <Input
                                        value={editingItem.unit || ''}
                                        onChange={e => setEditingItem({ ...editingItem, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
