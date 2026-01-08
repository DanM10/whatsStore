import {db} from "@/lib/firebase";
import {doc, getDoc} from "firebase/firestore";
import {Order} from "@/types/database";
import Link from "next/link";

export default async function DetallePedidoPage({params}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const docRef = doc(db, "pedidos", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return <div>Pedido no encontrado</div>;
    const pedido = { id: snap.id, ...snap.data() } as Order;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-sz-lg font-bold">Detalle del Pedido</h1>
                <Link href="/pedidos" className="text-primary text-sz-sm hover:underline">← Volver</Link>
            </div>

            <section className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <h3 className="text-muted text-sz-xs uppercase font-bold">Cliente</h3>
                    <p className="text-sz-base">{pedido.cliente.nombre} {pedido.cliente.apellido}</p>
                </div>
                <div>
                    <h3 className="text-muted text-sz-xs uppercase font-bold">Estado</h3>
                    <span className="text-sz-sm font-bold text-primary uppercase">{pedido.estado}</span>
                </div>
                <div>
                    <h3 className="text-muted text-sz-xs uppercase font-bold">Celular</h3>
                    <p className="text-sz-sm">{pedido.cliente.celular}</p>
                </div>
                <div className="col-span-2">
                    <h3 className="text-muted text-sz-xs uppercase font-bold">Dirección</h3>
                    <p className="text-sz-sm">{pedido.cliente.direccion}</p>
                </div>
            </section>

            <table className="w-full text-sz-sm mb-6">
                <thead className="border-b">
                <tr>
                    <th className="text-left py-2">Producto</th>
                    <th className="text-center py-2">Cant.</th>
                    <th className="text-right py-2">Precio</th>
                </tr>
                </thead>
                <tbody>
                {pedido.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                        <td className="py-2">{item.nombre}</td>
                        <td className="py-2 text-center">{item.cantidad}</td>
                        <td className="py-2 text-right">${item.precio.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="text-right">
                <p className="text-sz-lg font-bold text-primary">Total: ${pedido.total.toFixed(2)}</p>
            </div>
        </div>
    );
}