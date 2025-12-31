
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud } from 'lucide-react'

// Schema for form validation
const formSchema = z.object({
    market_id: z.string().min(1, 'Selecione um mercado.'),
    file: z // Validate file input manually later, but schema placeholder helps
        .any()
        .refine((files) => files?.length === 1, 'Selecione um arquivo PDF.')
        .refine((files) => files?.[0]?.type === 'application/pdf', 'O arquivo deve ser um PDF.')
        .refine((files) => files?.[0]?.size < 10 * 1024 * 1024, 'O arquivo deve ter no máximo 10MB.'),
})

interface Market {
    id: string
    name: string
}

interface FlyerUploadFormProps {
    markets: Market[]
}

export function FlyerUploadForm({ markets }: FlyerUploadFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            market_id: '',
            file: undefined,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const supabase = createClient()
        const file = values.file[0]

        // 1. Unique File Path: market_id/timestamp_filename.pdf
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `${values.market_id}/${timestamp}_${safeName}`

        try {
            // 2. Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('flyers')
                .upload(filePath, file)

            if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`)

            // 3. Insert into Database
            const { error: dbError } = await supabase.from('flyers').insert({
                market_id: values.market_id,
                pdf_path: uploadData.path,
                status: 'received', // Starts execution pipeline
            })

            if (dbError) throw new Error(`Erro ao salvar no banco: ${dbError.message}`)

            toast.success('Encarte enviado com sucesso!')
            router.push('/admin/flyers')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Erro desconhecido ao enviar encarte.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">

                {/* Market Selection */}
                <FormField
                    control={form.control}
                    name="market_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mercado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um mercado..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {markets.map((market) => (
                                        <SelectItem key={market.id} value={market.id}>
                                            {market.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                De qual mercado é este encarte?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* File Input */}
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Arquivo PDF</FormLabel>
                            <FormControl>
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                            onChange(e.target.files)
                                        }}
                                        {...rest}
                                    />
                                </div>
                            </FormControl>
                            <FormDescription>
                                Envie o arquivo PDF original. Máx 10MB.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            'Enviando...'
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Enviar Encarte
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
