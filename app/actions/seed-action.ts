'use server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function seedProducts() {
    const productosBase = [
        { codigo: 'pr-001', nombre: 'Pizza Familiar', precio: 15.99, stock: 20, descripcion: 'Pizza de pepperoni con extra queso.' },
        { codigo: 'pr-002', nombre: 'Hot Dog Especial', precio: 5.50, stock: 50, descripcion: 'Con salchicha artesanal y cebolla caramelizada.' },
        { codigo: 'pr-003', nombre: 'Gaseosa 1.5L', precio: 2.50, stock: 100, descripcion: 'Refresco de cola bien frío.' },
        { codigo: 'pr-004', nombre: 'Hamburguesa Doble', precio: 9.75, stock: 30, descripcion: 'Carne de res, queso cheddar y tocino.' },
    ];

    try {
        const productosRef = collection(db, "productos");

        for (const p of productosBase) {
            const q = query(productosRef, where("codigo", "==", p.codigo));
            const existe = await getDocs(q);

            if (existe.empty) {
                await addDoc(productosRef, p);
                console.log(`Añadido: ${p.nombre}`);
            }
        }
        return { success: true, message: "Seed completado correctamente" };
    } catch (error) {
        return { success: false, message: "Error en el seed: " + error };
    }
}