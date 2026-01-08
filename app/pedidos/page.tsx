export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Order } from "@/types/database";
import Link from "next/link";

export default async function PedidosPage() {
    const q = query(collection(db, "pedidos"), orderBy("fechas.creado", "desc"));
    const snapshot = await getDocs(q);
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];

    const statusStyles = {
        abierto: "bg-blue-100 text-blue-700",
        cerrado: "bg-green-100 text-green-700",
        cancelado: "bg-red-100 text-red-700",
    };

    return (
        <div>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-sz-xl font-bold">Gestión de Pedidos</h1>
                <Link href="/pedidos/nuevo" className="bg-primary text-white px-4 py-2 rounded text-sz-sm hover:bg-primary-dark transition">
                    + Crear Nuevo Pedido
                </Link>
            </div>

            <div className="bg-white border border-border rounded-lg overflow-hidden">
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
                  <span className={`px-2 py-1 rounded-full text-sz-xs font-medium ${statusStyles[o.estado]}`}>
                    {o.estado.toUpperCase()}
                  </span>
                            </td>
                            <td className="p-4">
                                <Link
                                    href={`/pedidos/${o.id}`}
                                    className="text-primary hover:underline text-sz-sm font-medium"
                                >
                                    Ver detalle
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}