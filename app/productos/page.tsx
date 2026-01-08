import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Product } from "@/types/database";
import {seedProducts} from "@/app/actions/seed-action";
import Link from "next/link";

export default async function ProductosPage() {
    // Obtenemos los productos directamente desde el servidor
    const snapshot = await getDocs(collection(db, "productos"));
    const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-sz-xl font-bold">Inventario de Productos</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productos.map((p) => (
                    <div key={p.id} className="border border-border p-4 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sz-md font-semibold">{p.nombre}</h3>
                            <Link
                                href={`/productos/editar/${p.id}`}
                                className="text-primary hover:text-primary-dark text-sz-xs font-bold"
                            >
                                EDITAR
                            </Link>
                        </div>

                        <p className="text-muted text-sz-sm mb-4">{p.descripcion}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-primary font-bold">${p.precio}</span>
                            <span className="text-sz-xs bg-slate-100 px-2 py-1 rounded">Stock: {p.stock}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}