"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {crearCliente} from "@/app/actions/cliente-action";

export default function NuevoClientePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        celular: '',
        direccion: '',
        email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.celular) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);

        const result = await crearCliente({
            nombre: formData.nombre,
            apellido: formData.apellido,
            celular: formData.celular,
            direccion: formData.direccion,
            email: formData.email || undefined
        });

        setLoading(false);

        if (result.success) {
            toast.success('¡Cliente registrado exitosamente!');
            router.push('/clientes');
        } else {
            toast.error(result.error || 'Error al registrar el cliente');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-sz-xl font-bold">Registrar Nuevo Cliente</h1>
                <Link
                    href="/clientes"
                    className="text-muted hover:underline text-sz-sm"
                >
                    Cancelar
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 border border-border rounded-lg shadow-sm flex flex-col gap-4"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sz-xs font-bold text-muted uppercase mb-1">
                            Nombre <span className="text-red-500">*</span>
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
                            Apellido <span className="text-red-500">*</span>
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
                        Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        placeholder="Ej: +593 99 123 4567"
                        className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                        required
                    />
                    <p className="text-sz-xs text-muted mt-1">
                        El celular será el identificador único del cliente
                    </p>
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
                        placeholder="cliente@ejemplo.com"
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
                        placeholder="Calle, número, ciudad..."
                        className="w-full p-2 border border-border rounded focus:border-primary outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white font-bold py-3 rounded hover:bg-primary-dark transition mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Registrando...' : 'Registrar Cliente'}
                </button>
            </form>
        </div>
    );
}