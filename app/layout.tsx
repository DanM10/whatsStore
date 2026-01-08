import "./globals.css";
import {Toaster} from 'sonner';
import Link from "next/link";

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body className="flex h-screen bg-background">
        <Toaster position="top-right" richColors/>
        <aside className="w-44 border-r border-border bg-white p-6 flex flex-col gap-6">
            <h2 className="text-sz-lg font-bold text-primary">Admin Panel</h2>
            <nav className="flex flex-col gap-2">
                <Link href="/productos" className="p-2 hover:bg-slate-100 rounded text-sz-base">
                    📦 Productos
                </Link>
                <Link href="/pedidos" className="p-2 hover:bg-slate-100 rounded text-sz-base">
                    📝 Pedidos
                </Link>
            </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
            {children}
        </main>
        </body>
        </html>
    );
}