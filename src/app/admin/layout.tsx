
import Link from 'next/link'
import { LayoutDashboard, Store, FileText, Settings, ShoppingBasket } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex md:w-64">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <ShoppingBasket className="h-6 w-6" />
                        <span className="hidden md:inline">Foz Market</span>
                    </Link>
                </div>
                <nav className="grid gap-2 p-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary md:justify-start justify-center"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden md:inline">Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/markets"
                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary md:justify-start justify-center"
                    >
                        <Store className="h-4 w-4" />
                        <span className="hidden md:inline">Mercados</span>
                    </Link>
                    <Link
                        href="/admin/flyers"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary md:justify-start justify-center"
                    >
                        <FileText className="h-4 w-4" />
                        <span className="hidden md:inline">Encartes</span>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary md:justify-start justify-center"
                    >
                        <Settings className="h-4 w-4" />
                        <span className="hidden md:inline">Configurações</span>
                    </Link>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-64">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
