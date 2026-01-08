import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types/database";
import Link from "next/link";
import { redirect } from "next/navigation";
import {actualizarProducto} from "@/app/actions/product-action";

export default async function EditarProductoPage({
                                                     params
                                                 }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const docRef = doc(db, "productos", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return <div>Producto no encontrado</div>;
    const producto = { id: snap.id, ...snap.data() } as Product;

    // Esta es una Server Action que se ejecuta al hacer submit
    async function handleSubmit(formData: FormData) {
        "use server";
        await actualizarProducto(id, formData);
        redirect("/productos");
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-sz-xl font-bold">Editar Producto</h1>
                <Link href="/productos" className="text-muted hover:underline text-sz-sm">Cancelar</Link>
            </div>

            <form action={handleSubmit} className="bg-white p-6 border border-border rounded-lg shadow-sm flex flex-col gap-4">
                <div>
                    <label className="block text-sz-xs font-bold text-muted uppercase mb-1">Código (No editable)</label>
                    <input
                        type="text"
                        value={producto.codigo}
                        disabled
                        className="w-full p-2 bg-slate-100 border border-border rounded text-muted cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sz-xs font-bold text-muted uppercase mb-1">Nombre</label>
                    <input
                        name="nombre"
                        defaultValue={producto.nombre}
                        className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sz-xs font-bold text-muted uppercase mb-1">Precio ($)</label>
                        <input
                            name="precio"
                            type="number"
                            step="0.01"
                            defaultValue={producto.precio}
                            className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sz-xs font-bold text-muted uppercase mb-1">Stock</label>
                        <input
                            name="stock"
                            type="number"
                            defaultValue={producto.stock}
                            className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sz-xs font-bold text-muted uppercase mb-1">Descripción</label>
                    <textarea
                        name="descripcion"
                        defaultValue={producto.descripcion}
                        rows={3}
                        className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3 rounded hover:bg-primary-dark transition mt-2"
                >
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}