import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Cliente, OrderItem, Order } from '@/types/database';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cliente, items }: { cliente: Cliente, items: { codigo: string, cantidad: number }[] } = body;

        if (!cliente || !items || items.length === 0) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const orderItems: OrderItem[] = [];
        let total = 0;

        // 1. Buscamos cada producto por su CÓDIGO para obtener datos reales
        for (const item of items) {
            const q = query(collection(db, "productos"), where("codigo", "==", item.codigo));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return NextResponse.json({ error: `Producto con código ${item.codigo} no existe` }, { status: 404 });
            }

            const prodDoc = querySnapshot.docs[0];
            const prodData = prodDoc.data();

            orderItems.push({
                productoId: prodDoc.id,
                nombre: prodData.nombre,
                precio: prodData.precio,
                cantidad: item.cantidad
            });

            total += prodData.precio * item.cantidad;
        }

        // 2. Creamos el objeto final del pedido
        const nuevoPedido: Omit<Order, 'id'> = {
            cliente,
            items: orderItems,
            total: Number(total.toFixed(2)),
            estado: 'abierto',
            fechas: {
                creado: serverTimestamp()
            }
        };

        // 3. Guardamos en Firestore
        const docRef = await addDoc(collection(db, "pedidos"), nuevoPedido);

        return NextResponse.json({
            success: true,
            pedidoId: docRef.id,
            mensaje: "Pedido creado vía API"
        }, { status: 201 });

    } catch (error) {
        console.error("API ERROR:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}