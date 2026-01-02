
'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Market {
    id: string
    name: string
    slug: string
    logo_url: string | null
    is_active: boolean
}

interface MarketsTableProps {
    markets: Market[]
}

export function MarketsTable({ markets }: MarketsTableProps) {
    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Logo</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {markets.map((market) => (
                        <TableRow key={market.id}>
                            <TableCell>
                                {market.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={market.logo_url || ''}
                                        alt={market.name}
                                        className="h-8 w-8 object-contain rounded-full bg-white p-1 border"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                        ?
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{market.name}</TableCell>
                            <TableCell>{market.slug}</TableCell>
                            <TableCell>
                                <Badge variant={market.is_active ? 'default' : 'secondary'}>
                                    {market.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem>
                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash className="mr-2 h-4 w-4" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
