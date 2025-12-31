
'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ProcessButton({ flyerId, status }: { flyerId: string, status: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    if (status === 'published') return null

    const handleProcess = async () => {
        setIsLoading(true)
        toast.info('Iniciando processamento com IA...')

        try {
            const response = await fetch('/api/process-flyer', {
                method: 'POST',
                body: JSON.stringify({ flyerId }),
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar')
            }

            toast.success(`Processado! ${data.itemsCount} itens extraídos.`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            variant={status === 'received' ? 'default' : 'outline'}
            onClick={handleProcess}
            disabled={isLoading || status === 'processing'}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            {status === 'review_needed' ? 'Reprocessar' : 'Processar IA'}
        </Button>
    )
}
