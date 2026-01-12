export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Cliente } from "@/types/database";
import Link from "next/link";

export default async function ClientesPage() {
    const q = query(collection(db, "clientes"), orderBy("fechaRegistro", "desc"));
    const snapshot = await getDocs(q);
    const clientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-sz-xl font-bold">Gestión de Clientes</h1>
                <Link
                    href="/clientes/nuevo"
                    className="bg-primary text-white px-4 py-2 rounded text-sz-sm hover:bg-primary-dark transition"
                >
                    + Registrar Cliente
                </Link>
            </div>

            {clientes.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-8 text-center">
                    <p className="text-muted text-sz-base mb-4">No hay clientes registrados</p>
                    <Link
                        href="/clientes/nuevo"
                        className="text-primary hover:underline font-medium"
                    >
                        Registrar el primer cliente
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-border">
                        <tr>
                            <th className="p-4 text-sz-sm font-semibold">Nombre Completo</th>
                            <th className="p-4 text-sz-sm font-semibold">Celular</th>
                            <th className="p-4 text-sz-sm font-semibold">Dirección</th>
                            <th className="p-4 text-sz-sm font-semibold">Email</th>
                            <th className="p-4 text-sz-sm font-semibold text-center">Pedidos</th>
                            <th className="p-4 text-sz-sm font-semibold text-right">Total Gastado</th>
                            <th className="p-4 text-sz-sm font-semibold">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clientes.map((cliente) => (
                            <tr key={cliente.id} className="border-b border-border hover:bg-slate-50">
                                <td className="p-4 text-sz-sm font-medium">
                                    {cliente.nombre} {cliente.apellido}
                                </td>
                                <td className="p-4 text-sz-sm text-muted">
                                    {cliente.celular}
                                </td>
                                <td className="p-4 text-sz-sm text-muted">
                                    {cliente.direccion || '-'}
                                </td>
                                <td className="p-4 text-sz-sm text-muted">
                                    {cliente.email || '-'}
                                </td>
                                <td className="p-4 text-sz-sm text-center">
                                    {cliente.totalPedidos || 0}
                                </td>
                                <td className="p-4 text-sz-sm font-bold text-primary text-right">
                                    ${(cliente.totalGastado || 0).toFixed(2)}
                                </td>
                                <td className="p-4">
                                    <Link
                                        href={`/clientes/${cliente.id}`}
                                        className="text-primary hover:underline text-sz-sm font-medium"
                                    >
                                        Ver detalles
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}