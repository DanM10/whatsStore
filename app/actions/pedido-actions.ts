import {Property} from "csstype";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {Cliente, Order, OrderItem} from "@/types/database";

export async function crearNuevoPedido(cliente: Cliente, carrito: OrderItem[]) {
    try {
        const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

        const nuevoPedido: Omit<Order, 'id'> = {
            cliente: cliente,
            items: carrito,
            total: Number(total.toFixed(2)),
            estado: 'abierto',
            fechas: {
                creado: serverTimestamp()
            }
        };

        const docRef = await addDoc(collection(db, "pedidos"), nuevoPedido);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}