"use client";
import { useState } from 'react';
import { Cliente } from '@/types/database';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {actualizarCliente} from "@/app/actions/cliente-action";

export default function ClienteEditForm({ cliente }: { cliente: Cliente }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        celular: cliente.celular,
        direccion: cliente.direccion || '',
        email: cliente.email || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await actualizarCliente(cliente.id!, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            celular: formData.celular,
            direccion: formData.direccion,
            email: formData.email || undefined
        });

        setLoading(false);

        if (result.success) {
            toast.success('Cliente actualizado exitosamente');
            setIsEditing(false);
            router.refresh();
        } else {
            toast.error(result.error || 'Error al actualizar el cliente');
        }
    };

    const handleCancel = () => {
        setFormData({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            celular: cliente.celular,
            direccion: cliente.direccion || '',
            email: cliente.email || ''
        });
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sz-lg font-bold">Información del Cliente</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary hover:text-primary-dark text-sz-sm font-bold"
                    >
                        EDITAR
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sz-xs font-bold text-muted uppercase mb-1">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sz-xs font-bold text-muted uppercase mb-1">
                                Apellido
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sz-xs font-bold text-muted uppercase mb-1">
                            Celular
                        </label>
                        <input
                            type="tel"
                            name="celular"
                            value={formData.celular}
                            onChange={handleChange}
                            className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sz-xs font-bold text-muted uppercase mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sz-xs font-bold text-muted uppercase mb-1">
                            Dirección
                        </label>
                        <textarea
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                        />
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-white font-bold py-2 rounded hover:bg-primary-dark transition disabled:bg-gray-400"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sz-xs font-bold text-muted uppercase mb-1">Nombre</h3>
                            <p className="text-sz-base">{cliente.nombre}</p>
                        </div>
                        <div>
                            <h3 className="text-sz-xs font-bold text-muted uppercase mb-1">Apellido</h3>
                            <p className="text-sz-base">{cliente.apellido}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sz-xs font-bold text-muted uppercase mb-1">Celular</h3>
                        <p className="text-sz-base">{cliente.celular}</p>
                    </div>

                    {cliente.email && (
                        <div>
                            <h3 className="text-sz-xs font-bold text-muted uppercase mb-1">Email</h3>
                            <p className="text-sz-base">{cliente.email}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sz-xs font-bold text-muted uppercase mb-1">Dirección</h3>
                        <p className="text-sz-base">{cliente.direccion || 'No especificada'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}