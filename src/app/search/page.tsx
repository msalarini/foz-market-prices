
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

import { Metadata } from 'next'

interface SearchPageProps {
    searchParams: Promise<{ q: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const { q } = await searchParams
    return {
        title: q ? `Preço de ${q} | Foz Market` : 'Busca | Foz Market',
        description: `Compare preços de ${q || 'mercado'} em Foz do Iguaçu. Encontre o menor preço nos encartes de hoje.`,
    }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams
    const query = q || ''

    const supabase = await createClient()

    // --- CORE SEARCH LOGIC ---
    // 1. Full Text Search on 'clean_name' and 'raw_name'
    // Using websearch_to_tsquery for natural language handling
    const { data: items, error } = await supabase
        .from('flyer_items')
        .select(`
        *,
        markets (name, logo_url),
        flyers (valid_until)
    `)
        // Only published items (via flyers status check ideally, but RLS handles this mostly)
        .textSearch('search_vector', query, {
            type: 'websearch',
            config: 'portuguese'
        })
        .order('price', { ascending: true }) // Already sorted by cheapness!

    if (error) {
        console.error(error)
    }

    async function searchAction(formData: FormData) {
        'use server'
        const newQuery = formData.get('q')
        if (newQuery) {
            redirect(`/search?q=${encodeURIComponent(newQuery.toString())}`)
        }
    }

    // --- GROUPING LOGIC (The "A/B/C" Levels) ---
    // Since SQL gave us a flat list, we need to present it effectively.
    // Ideally, we'd group by "Semantic Product" (e.g. all "Arroz Tio Joao 5kg" together).
    // For MVP: We render the list, but highlight the FIRST one as "Melhor Preço".

    const hasResults = items && items.length > 0
    const bestPriceItem = hasResults ? items[0] : null
    const otherItems = hasResults ? items.slice(1) : []

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Compacto */}
            <header className="flex h-16 items-center gap-4 px-4 border-b bg-background sticky top-0 z-10">
                <Link href="/">
                    <div className="font-bold text-lg text-primary hidden sm:block">Foz Market</div>
                    <ArrowLeft className="h-6 w-6 sm:hidden" />
                </Link>
                <form action={searchAction} className="flex-1 flex gap-2 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="q"
                            defaultValue={query}
                            className="pl-9 h-9"
                        />
                    </div>
                </form>
            </header>

            <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
                <h1 className="text-xl font-semibold text-muted-foreground">
                    Resultados para <span className="text-foreground">"{query}"</span>
                </h1>

                {!hasResults ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-lg font-medium">Nenhum produto encontrado.</h2>
                        <p className="text-muted-foreground">Tente buscar por termos mais simples como "arroz" ou "café".</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* BEST DEAL CARD */}
                        <div className="border border-primary/20 bg-primary/5 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-xl">
                                MELHOR PREÇO
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        {bestPriceItem.markets?.logo_url && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={bestPriceItem.markets.logo_url} alt="" className="h-5 w-5 object-contain" />
                                        )}
                                        {bestPriceItem.markets?.name}
                                    </div>
                                    <h2 className="text-2xl font-bold">{bestPriceItem.clean_name || bestPriceItem.raw_name}</h2>
                                    <p className="text-sm text-muted-foreground">{bestPriceItem.raw_name}</p>
                                    {bestPriceItem.promo_text && (
                                        <Badge variant="secondary" className="mt-2">{bestPriceItem.promo_text}</Badge>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-extrabold text-green-700">
                                        R$ {bestPriceItem.price?.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {bestPriceItem.quantity > 1 ? `${bestPriceItem.quantity} ${bestPriceItem.unit}` : bestPriceItem.unit}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Válido até {bestPriceItem.flyers?.valid_until ? new Date(bestPriceItem.flyers.valid_until).toLocaleDateString('pt-BR') : '?'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OTHER OPTIONS LIST */}
                        {otherItems.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Outras opções</h3>
                                <div className="grid gap-3">
                                    {otherItems.map(item => (
                                        <div key={item.id} className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                    {item.markets?.name}
                                                </div>
                                                <div className="font-medium truncate">{item.clean_name || item.raw_name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{item.raw_name}</div>
                                            </div>
                                            <div className="text-right whitespace-nowrap">
                                                <div className="font-bold text-lg">
                                                    R$ {item.price?.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
