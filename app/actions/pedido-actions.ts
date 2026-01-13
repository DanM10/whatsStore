import {
    doc,
    updateDoc,
    increment,
    serverTimestamp,
    addDoc,
    collection,
    query,
    getDocs,
    where
} from 'firebase/firestore';
import {db} from "@/lib/firebase";
import {Cliente, Order, OrderItem} from "@/types/database";

async function buscarOCrearCliente(clienteData: Omit<Cliente, 'id' | 'fechaRegistro' | 'totalPedidos' | 'totalGastado'>): Promise<{ success: boolean; clienteId?: string; error?: string }> {
    try {
        const q = query(collection(db, "clientes"), where("celular", "==", clienteData.celular));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const clienteDoc = querySnapshot.docs[0];
            return { success: true, clienteId: clienteDoc.id };
        }

        const nuevoCliente = {
            ...clienteData,
            fechaRegistro: serverTimestamp(),
            totalPedidos: 0,
            totalGastado: 0
        };

        const docRef = await addDoc(collection(db, "clientes"), nuevoCliente);
        return { success: true, clienteId: docRef.id };
    } catch (error) {
        console.error("Error al buscar/crear cliente:", error);
        return { success: false, error: String(error) };
    }
}

export async function crearNuevoPedido(clienteData: Omit<Cliente, 'id' | 'fechaRegistro' | 'totalPedidos' | 'totalGastado'>, carrito: OrderItem[]) {
    try {
        const clienteResult = await buscarOCrearCliente(clienteData);

        if (!clienteResult.success || !clienteResult.clienteId) {
            return { success: false, error: clienteResult.error || "Error al procesar cliente" };
        }

        const clienteId = clienteResult.clienteId;

        const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

        const nuevoPedido: Omit<Order, 'id'> = {
            clienteId: clienteId,
            cliente: clienteData,
            items: carrito,
            total: Number(total.toFixed(2)),
            estado: 'recibido',
            fechas: {
                creado: serverTimestamp()
            }
        };

        const docRef = await addDoc(collection(db, "pedidos"), nuevoPedido);

        const clienteRef = doc(db, "clientes", clienteId);
        await updateDoc(clienteRef, {
            totalPedidos: increment(1),
            totalGastado: increment(Number(total.toFixed(2)))
        });

        return { success: true, id: docRef.id, clienteId };
    } catch (error) {
        console.error("Error al crear pedido:", error);
        return { success: false, error: String(error) };
    }
}

