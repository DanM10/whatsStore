'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [start, setStart] = useState(searchParams.get('start') || '');
    const [end, setEnd] = useState(searchParams.get('end') || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        if (start && end) {
            router.push(`/pedidos?start=${start}&end=${end}`);
        }
    };

    return (
        <form onSubmit={handleFilter} className="bg-white p-4 border border-border rounded-t-lg flex flex-wrap items-end gap-4">
            <div>
                <label className="block text-sz-xs font-semibold text-muted mb-1 uppercase">Desde</label>
                <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="border border-border rounded p-2 text-sz-sm outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
            <div>
                <label className="block text-sz-xs font-semibold text-muted mb-1 uppercase">Hasta</label>
                <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="border border-border rounded p-2 text-sz-sm outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
            <button
                type="submit"
                className="bg-slate-800 text-white px-4 py-2 rounded text-sz-sm hover:bg-slate-900 transition"
            >
                Filtrar
            </button>
            <button
                type="button"
                onClick={() => { setStart(''); setEnd(''); router.push('/pedidos'); }}
                className="text-sz-sm text-red-500 hover:underline"
            >
                Limpiar
            </button>
        </form>
    );
}