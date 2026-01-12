"use client";
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {eliminarCliente} from "@/app/actions/cliente-action";

export default function ClienteDeleteButton({
                                                clienteId,
                                                tienePedidos
                                            }: {
    clienteId: string;
    tienePedidos: boolean;
}) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);

        const result = await eliminarCliente(clienteId);

        setLoading(false);

        if (result.success) {
            toast.success('Cliente eliminado exitosamente');
            router.push('/clientes');
        } else {
            toast.error(result.error || 'Error al eliminar el cliente');
            setShowConfirm(false);
        }
    };

    if (tienePedidos) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sz-xs text-yellow-800">
                    ⚠️ No se puede eliminar un cliente con pedidos asociados
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 border border-red-200 rounded-lg shadow-sm">
            <h3 className="text-sz-xs font-bold text-red-600 uppercase mb-2">Zona de Peligro</h3>

            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition"
                >
                    Eliminar Cliente
                </button>
            ) : (
                <div className="space-y-2">
                    <p className="text-sz-xs text-red-700 mb-3">
                        ¿Estás seguro? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition disabled:bg-gray-400"
                        >
                            {loading ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}