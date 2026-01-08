'use server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '@/types/database';

export async function crearPedido(pedido: Omit<Order, 'id' | 'fechas'>) {
    try {
        const docRef = await addDoc(collection(db, "pedidos"), {
            ...pedido,
            fechas: {
                creado: serverTimestamp(),
            }
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export async function cancelarPedido(pedidoId: string, motivo: string) {
    try {
        const pedidoRef = doc(db, "pedidos", pedidoId);
        await updateDoc(pedidoRef, {
            estado: 'cancelado' as OrderStatus,
            motivoCancelacion: motivo,
            'fechas.cancelado': serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}