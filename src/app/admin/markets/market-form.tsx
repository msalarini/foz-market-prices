
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Nome deve ter pelo menos 2 caracteres.',
    }),
    slug: z.string().min(2, {
        message: 'Slug deve ter pelo menos 2 caracteres.',
    }).regex(/^[a-z0-9-]+$/, {
        message: 'Slug deve conter apenas letras minúsculas, números e hífens.',
    }),
    logo_url: z.string().url().optional().or(z.literal('')),
    is_active: z.boolean().default(true),
})

export function MarketForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
            logo_url: '',
            is_active: true,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase.from('markets').insert({
                name: values.name,
                slug: values.slug,
                logo_url: values.logo_url || null,
                is_active: values.is_active,
            })

            if (error) {
                if (error.code === '23505') { // Unique violation
                    form.setError('slug', { message: 'Este slug já está em uso.' })
                    return
                }
                throw error
            }

            toast.success('Mercado criado com sucesso!')
            router.push('/admin/markets')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao criar mercado.')
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-generate slug from name
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value
        form.setValue('name', name)

        // Only auto-update slug if it hasn't been manually touched (simplification: always update if empty or matching previous slug logic)
        // For now, let's just do a simple suggested slug
        const slug = name
            .toLowerCase()
            .normalize('NFD') // Remove accents
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        // Check if user manually edited slug (optional refinement), for now just simple sync
        if (!form.getFieldState('slug').isDirty) {
            form.setValue('slug', slug)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Mercado</FormLabel>
                            <FormControl>
                                <Input placeholder="Supermercado Exemplo" {...field} onChange={(e) => {
                                    handleNameChange(e)
                                    field.onChange(e)
                                }} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug (URL)</FormLabel>
                            <FormControl>
                                <Input placeholder="supermercado-exemplo" {...field} />
                            </FormControl>
                            <FormDescription>
                                Identificador único na URL.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL do Logo</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Ativo</FormLabel>
                                <FormDescription>
                                    Mercados inativos não aparecem nas buscas.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Criar Mercado'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
