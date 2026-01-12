import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Cliente, Order } from "@/types/database";
import Link from "next/link";
import ClienteEditForm from "@/components/Clienteeditform";
import ClienteDeleteButton from "@/components/ClienteDeleteForm";

export default async function DetalleClientePage({
                                                     params
                                                 }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // Obtener datos del cliente
    const clienteRef = doc(db, "clientes", id);
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <h1 className="text-sz-xl font-bold mb-4">Cliente no encontrado</h1>
                <Link href="/clientes" className="text-primary hover:underline">
                    Volver a clientes
                </Link>
            </div>
        );
    }

    const cliente = { id: clienteSnap.id, ...clienteSnap.data() } as Cliente;

    // Obtener pedidos del cliente
    const pedidosQuery = query(
        collection(db, "pedidos"),
        where("clienteId", "==", id),
        orderBy("fechas.creado", "desc")
    );
    const pedidosSnap = await getDocs(pedidosQuery);
    const pedidos = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];

    const statusStyles = {
        abierto: "bg-blue-100 text-blue-700",
        cerrado: "bg-green-100 text-green-700",
        cancelado: "bg-red-100 text-red-700",
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-sz-xl font-bold">Detalle del Cliente</h1>
                <Link href="/clientes" className="text-primary text-sz-sm hover:underline">
                    ← Volver
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información del Cliente */}
                <div className="lg:col-span-2">
                    <ClienteEditForm cliente={cliente} />
                </div>

                {/* Estadísticas */}
                <div className="space-y-4">
                    <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
                        <h3 className="text-sz-xs font-bold text-muted uppercase mb-2">Estadísticas</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sz-xs text-muted">Total de Pedidos</p>
                                <p className="text-sz-lg font-bold text-primary">
                                    {cliente.totalPedidos || pedidos.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sz-xs text-muted">Total Gastado</p>
                                <p className="text-sz-lg font-bold text-green-600">
                                    ${(cliente.totalGastado || 0).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sz-xs text-muted">Fecha de Registro</p>
                                <p className="text-sz-sm">
                                    {cliente.fechaRegistro?.toDate().toLocaleDateString() || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botón de Eliminar */}
                    <ClienteDeleteButton clienteId={id} tienePedidos={pedidos.length > 0} />
                </div>
            </div>

            {/* Historial de Pedidos */}
            <div className="mt-8">
                <h2 className="text-sz-lg font-bold mb-4">Historial de Pedidos</h2>

                {pedidos.length === 0 ? (
                    <div className="bg-white border border-border rounded-lg p-8 text-center">
                        <p className="text-muted text-sz-base mb-4">
                            Este cliente no tiene pedidos registrados
                        </p>
                        <Link
                            href="/pedidos/nuevo"
                            className="text-primary hover:underline font-medium"
                        >
                            Crear primer pedido
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-border">
                            <tr>
                                <th className="p-4 text-sz-sm font-semibold">Fecha</th>
                                <th className="p-4 text-sz-sm font-semibold">Items</th>
                                <th className="p-4 text-sz-sm font-semibold">Total</th>
                                <th className="p-4 text-sz-sm font-semibold">Estado</th>
                                <th className="p-4 text-sz-sm font-semibold">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id} className="border-b border-border hover:bg-slate-50">
                                    <td className="p-4 text-sz-sm text-muted">
                                        {pedido.fechas.creado?.toDate().toLocaleDateString() || "N/A"}
                                    </td>
                                    <td className="p-4 text-sz-sm">
                                        {pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''}
                                    </td>
                                    <td className="p-4 text-sz-sm font-bold text-primary">
                                        ${pedido.total.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-sz-xs font-medium ${statusStyles[pedido.estado]}`}>
                                                {pedido.estado.toUpperCase()}
                                            </span>
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/pedidos/${pedido.id}`}
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
                )}
            </div>
        </div>
    );
}