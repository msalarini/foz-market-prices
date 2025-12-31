
import { createClient } from '@/lib/supabase/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// Schema for AI Output (Structuring the Chaos)
const FlyerItemSchema = z.object({
    items: z.array(z.object({
        raw_name: z.string().describe('Nome completo como aparece no encarte'),
        clean_name: z.string().describe('Nome normalizado do produto (ex: Arroz, Feijão, Detergente)'),
        brand: z.string().optional().describe('Marca do produto se identificável'),
        price: z.number().describe('Preço do produto. Se tiver centavos, usar ponto decimal.'),
        unit: z.enum(['kg', 'un', 'L', 'g', 'ml', 'pct']).optional().describe('Unidade de medida'),
        quantity: z.number().optional().describe('Quantidade numérica da unidade (ex: 500 para 500g)'),
        promo_text: z.string().optional().describe('Texto de promoção (leve 3, clube, etc)'),
    })),
    valid_until: z.string().optional().describe('Data de validade do encarte no formato YYYY-MM-DD')
})

export async function POST(req: NextRequest) {
    try {
        const { flyerId } = await req.json()
        if (!flyerId) return NextResponse.json({ error: 'Missing flyerId' }, { status: 400 })

        const supabase = await createClient()

        // 1. Get Flyer Info
        const { data: flyer, error: flyerError } = await supabase
            .from('flyers')
            .select('*')
            .eq('id', flyerId)
            .single()

        if (flyerError || !flyer) {
            return NextResponse.json({ error: 'Flyer not found' }, { status: 404 })
        }

        // 2. Download PDF from Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('flyers')
            .download(flyer.pdf_path)

        if (downloadError || !fileData) {
            return NextResponse.json({ error: 'Failed to download PDF' }, { status: 500 })
        }

        // 3. Convert to Base64
        const arrayBuffer = await fileData.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString('base64')

        // 4. Send to Gemini
        // Using simple prompt eng pattern with Vision
        const result = await generateObject({
            model: google('gemini-1.5-pro-latest'),
            schema: FlyerItemSchema,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analise este encarte de supermercado. Extraia todos os produtos com seus preços. Identifique a data de validade do encarte se houver.' },
                        { type: 'file', data: base64Data, mimeType: 'application/pdf' } as any,
                    ],
                },
            ],
        })

        const extracted = result.object

        // 5. Save Items to Database
        const itemsToInsert = extracted.items.map(item => ({
            flyer_id: flyerId,
            market_id: flyer.market_id,
            raw_name: item.raw_name,
            clean_name: item.clean_name,
            brand: item.brand,
            price: item.price,
            unit: item.unit || 'un',
            quantity: item.quantity || 1,
            promo_text: item.promo_text,
            confidence_score: 0.9, // Mocking confidence for now, Gemini is usually high
            needs_review: false, // Default to false for MVP, logic can be improved
        }))

        if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('flyer_items')
                .insert(itemsToInsert)

            if (insertError) throw insertError
        }

        // 6. Update Flyer Status
        await supabase
            .from('flyers')
            .update({
                status: 'review_needed', // Always review for now
                valid_until: extracted.valid_until || null
            })
            .eq('id', flyerId)

        return NextResponse.json({ success: true, itemsCount: itemsToInsert.length })

    } catch (error: any) {
        console.error('Processing Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
