'use server';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { Cliente } from '@/types/database';

export async function crearCliente(clienteData: Omit<Cliente, 'id' | 'fechaRegistro' | 'totalPedidos' | 'totalGastado'>) {
    try {
        const q = query(collection(db, "clientes"), where("celular", "==", clienteData.celular));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return {
                success: false,
                error: 'Ya existe un cliente con ese número de celular'
            };
        }

        const nuevoCliente = {
            ...clienteData,
            fechaRegistro: serverTimestamp(),
            totalPedidos: 0,
            totalGastado: 0
        };

        const docRef = await addDoc(collection(db, "clientes"), nuevoCliente);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al crear cliente:", error);
        return { success: false, error: String(error) };
    }
}

export async function actualizarCliente(id: string, clienteData: Partial<Cliente>) {
    try {
        const clienteRef = doc(db, "clientes", id);

        if (clienteData.celular) {
            const q = query(
                collection(db, "clientes"),
                where("celular", "==", clienteData.celular)
            );
            const querySnapshot = await getDocs(q);

            const existeOtro = querySnapshot.docs.some(doc => doc.id !== id);
            if (existeOtro) {
                return {
                    success: false,
                    error: 'Ya existe otro cliente con ese número de celular'
                };
            }
        }

        await updateDoc(clienteRef, clienteData);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        return { success: false, error: String(error) };
    }
}

export async function eliminarCliente(id: string) {
    try {
        const pedidosQuery = query(
            collection(db, "pedidos"),
            where("clienteId", "==", id)
        );
        const pedidosSnapshot = await getDocs(pedidosQuery);

        if (!pedidosSnapshot.empty) {
            return {
                success: false,
                error: 'No se puede eliminar un cliente con pedidos asociados'
            };
        }

        const clienteRef = doc(db, "clientes", id);
        await deleteDoc(clienteRef);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        return { success: false, error: String(error) };
    }
}

export async function buscarClientePorCelular(celular: string) {
    try {
        const q = query(collection(db, "clientes"), where("celular", "==", celular));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: 'Cliente no encontrado' };
        }

        const clienteDoc = querySnapshot.docs[0];
        const cliente = { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;

        return { success: true, cliente };
    } catch (error) {
        console.error("Error al buscar cliente:", error);
        return { success: false, error: String(error) };
    }
}