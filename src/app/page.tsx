
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/navigation'

export default function Home() {

  async function searchAction(formData: FormData) {
    'use server'
    const query = formData.get('q')
    if (query) {
      redirect(`/search?q=${encodeURIComponent(query.toString())}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          🛒 Foz Market
        </div>
        <nav className="flex gap-4">
          <Link href="/admin" className="text-sm font-medium hover:underline">
            Área do Mercado
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-8 bg-gradient-to-b from-background to-muted/20">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Compare preços de <span className="text-primary">Supermercado</span> em Foz.
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto">
            Nós lemos os encartes para você. Encontre onde está mais barato hoje.
          </p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <form action={searchAction} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Ex: Arroz, Leite, Picanha..."
                className="pl-9 h-10 shadow-sm"
                autoFocus
              />
            </div>
            <Button type="submit" size="lg">Buscar</Button>
          </form>
          <div className="flex gap-2 justify-center text-sm text-muted-foreground pt-4">
            <span>Buscas comuns:</span>
            <Link href="/search?q=café" className="hover:text-primary hover:underline">Café</Link>
            <Link href="/search?q=leite" className="hover:text-primary hover:underline">Leite</Link>
            <Link href="/search?q=cerveja" className="hover:text-primary hover:underline">Cerveja</Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>© 2024 Foz Market. Preços baseados em encartes públicos.</p>
      </footer>
    </div>
  )
}
