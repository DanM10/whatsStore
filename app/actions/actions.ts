'use server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type FormState = { success: boolean; message: string; } | null;

export async function registrarUsuario(prevState: FormState, formData: FormData): Promise<FormState> {
    const nombre = formData.get('nombre') as string;

    try {
        await addDoc(collection(db, "usuarios"), {
            nombre: nombre,
            fechaCreacion: serverTimestamp()
        });

        return { success: true, message: `¡${nombre} guardado en Firestore!` };
    } catch (error) {
        console.error("Error al guardar:", error);
        return { success: false, message: "Error al conectar con Firebase" };
    }
}