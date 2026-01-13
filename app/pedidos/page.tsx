import FilterBar from "@/components/FilterBar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, Timestamp } from "firebase/firestore";
import { Order, OrderStatus } from "@/types/database";
import Link from "next/link";
interface Props {
    searchParams: { start?: string; end?: string };
}

export default async function PedidosPage({ searchParams }: Props) {
    const { start, end } = await searchParams;
    let pedidos: Order[] = [];

    if (start && end) {
        const startDate = new Date(`${start}T00:00:00`);
        const endDate = new Date(`${end}T23:59:59`);

        const q = query(
            collection(db, "pedidos"),
            where("fechas.creado", ">=", Timestamp.fromDate(startDate)),
            where("fechas.creado", "<=", Timestamp.fromDate(endDate)),
            orderBy("fechas.creado", "desc")
        );
        const snapshot = await getDocs(q);
        pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
    }

    const handleEstadoStyle = (estado: OrderStatus) => {
        const styles: Record<string, string> = {
            recibido: "bg-yellow-100 text-yellow-700",
            entregado: "bg-green-100 text-green-700",
            cobrado: "bg-purple-100 text-purple-700",
            cerrado: "bg-gray-100 text-gray-700",
            cancelado: "bg-red-100 text-red-700",
        };
        return styles[estado] || "bg-gray-100 text-gray-700";
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-sz-xl font-bold">Gestión de Pedidos</h1>
                <Link href="/pedidos/nuevo" className="bg-primary text-white px-4 py-2 rounded text-sz-sm hover:bg-primary-dark transition">
                    + Crear Nuevo Pedido
                </Link>
            </div>
            <FilterBar />
            <div className="bg-white border border-border rounded-b-lg overflow-hidden">
                {pedidos.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-border">
                        <tr>
                            <th className="p-4 text-sz-sm font-semibold">Cliente</th>
                            <th className="p-4 text-sz-sm font-semibold">Fecha</th>
                            <th className="p-4 text-sz-sm font-semibold">Total</th>
                            <th className="p-4 text-sz-sm font-semibold">Estado</th>
                            <th className="p-4 text-sz-sm font-semibold">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pedidos.map((o) => (
                            <tr key={o.id} className="border-b border-border hover:bg-slate-50">
                                <td className="p-4 text-sz-sm font-medium">
                                    {o.cliente.nombre} {o.cliente.apellido}
                                </td>
                                <td className="p-4 text-sz-sm text-muted">
                                    {o.fechas.creado?.toDate().toLocaleDateString() || "Pendiente"}
                                </td>
                                <td className="p-4 text-sz-sm font-bold text-primary">${o.total}</td>
                                <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-sz-xs font-medium ${handleEstadoStyle(o.estado)}`}>
                                            {o.estado.toUpperCase()}
                                        </span>
                                </td>
                                <td className="p-4">
                                    <Link href={`/pedidos/${o.id}`} className="text-primary hover:underline text-sz-sm font-medium">
                                        Ver detalle
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    /* Estado Vacío */
                    <div className="p-20 text-center">
                        <div className="text-slate-300 mb-4 text-6xl">📅</div>
                        <h3 className="text-sz-lg font-medium text-slate-600">
                            {(!start || !end) ? "Selecciona un rango de fechas" : "No hay pedidos en este rango"}
                        </h3>
                        <p className="text-sz-sm text-muted">
                            {(!start || !end) ? "Para visualizar la lista, por favor elige una fecha de inicio y fin." : "Intenta con otro periodo de tiempo."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}