import {doc, updateDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";

export async function actualizarProducto(id: string, formData: FormData) {
    try {
        const productoRef = doc(db, "productos", id);
        await updateDoc(productoRef, {
            nombre: formData.get('nombre') as string,
            precio: Number(formData.get('precio')),
            stock: Number(formData.get('stock')),
            descripcion: formData.get('descripcion') as string,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

