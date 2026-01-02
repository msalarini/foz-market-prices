
import { MarketForm } from '../market-form'

export default function NewMarketPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Novo Mercado</h1>
            <div className="rounded-lg border p-6 shadow-sm bg-card">
                <MarketForm />
            </div>
        </div>
    )
}
