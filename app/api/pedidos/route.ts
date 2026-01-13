import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import {  OrderItem, Order } from '@/types/database';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cliente, items }: {
            cliente: { nombre: string; apellido: string; celular: string; direccion?: string; email?: string },
            items: { codigo: string, cantidad: number }[]
        } = body;

        if (!cliente || !items || items.length === 0) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        if (!cliente.celular || !cliente.nombre || !cliente.apellido) {
            return NextResponse.json({ error: "Datos del cliente incompletos (celular, nombre y apellido son obligatorios)" }, { status: 400 });
        }

        let clienteId: string;
        let clienteExistente = false;

        const clienteQuery = query(collection(db, "clientes"), where("celular", "==", cliente.celular));
        const clienteSnapshot = await getDocs(clienteQuery);

        if (!clienteSnapshot.empty) {
            clienteId = clienteSnapshot.docs[0].id;
            clienteExistente = true;
        } else {
            const nuevoCliente = {
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                celular: cliente.celular,
                direccion: cliente.direccion || "",
                email: cliente.email || undefined,
                fechaRegistro: serverTimestamp(),
                totalPedidos: 0,
                totalGastado: 0
            };

            const clienteDocRef = await addDoc(collection(db, "clientes"), nuevoCliente);
            clienteId = clienteDocRef.id;
        }

        const orderItems: OrderItem[] = [];
        let total = 0;

        for (const item of items) {
            const q = query(collection(db, "productos"), where("codigo", "==", item.codigo));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return NextResponse.json({
                    error: `Producto con código ${item.codigo} no existe`
                }, { status: 404 });
            }

            const prodDoc = querySnapshot.docs[0];
            const prodData = prodDoc.data();

            if (prodData.stock < item.cantidad) {
                return NextResponse.json({
                    error: `Stock insuficiente para ${prodData.nombre}. Disponible: ${prodData.stock}, solicitado: ${item.cantidad}`
                }, { status: 400 });
            }

            orderItems.push({
                productoId: prodDoc.id,
                nombre: prodData.nombre,
                precio: prodData.precio,
                cantidad: item.cantidad
            });

            total += prodData.precio * item.cantidad;
        }

        const nuevoPedido: Omit<Order, 'id'> = {
            clienteId: clienteId,
            cliente: {
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                celular: cliente.celular,
                direccion: cliente.direccion || "",
                email: cliente.email
            },
            items: orderItems,
            total: Number(total.toFixed(2)),
            estado: 'recibido',
            fechas: {
                creado: serverTimestamp()
            }
        };

        const pedidoDocRef = await addDoc(collection(db, "pedidos"), nuevoPedido);

        const clienteRef = doc(db, "clientes", clienteId);
        await updateDoc(clienteRef, {
            totalPedidos: increment(1),
            totalGastado: increment(Number(total.toFixed(2)))
        });

        return NextResponse.json({
            success: true,
            pedidoId: pedidoDocRef.id,
            clienteId: clienteId,
            clienteNuevo: !clienteExistente,
            mensaje: clienteExistente
                ? "Pedido creado para cliente existente"
                : "Cliente creado y pedido registrado"
        }, { status: 201 });

    } catch (error) {
        console.error("API ERROR:", error);
        return NextResponse.json({
            error: "Error interno del servidor",
            detalle: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}