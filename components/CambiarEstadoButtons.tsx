"use client";

import {OrderStatus} from "@/types/database";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";

export default function CambiarEstadoButtons({
    estado,
    id
}: {
    estado: OrderStatus;
    id: string;
}) {
    const onChangeEstado = async (nuevoEstado: OrderStatus) => {
        const pedidoRef = doc(db, "pedidos", id);
        await updateDoc(pedidoRef, {
            estado: nuevoEstado
        });
    };
    return (
        <div className="flex gap-2">
            {estado !== 'entregado' && estado !== 'cerrado' && estado !== 'cancelado' && (
                <button
                    onClick={() => onChangeEstado('entregado')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Marcar como Entregado
                </button>
            )}
            {estado !== 'cobrado' && estado !== 'cerrado' && estado !== 'cancelado' && (
                <button
                    onClick={() => onChangeEstado('cobrado')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Marcar como Cobrado
                </button>
            )}
            {estado !== 'cerrado' && estado !== 'cancelado' && (
                <button
                    onClick={() => onChangeEstado('cerrado')}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Cerrar Pedido
                </button>
            )}
            {estado !== 'cancelado' && (
                <button
                    onClick={() => onChangeEstado('cancelado')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Cancelar Pedido
                </button>
            )}
        </div>
    );
}