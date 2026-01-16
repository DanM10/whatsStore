"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Cliente } from '@/types/database';
import { actualizarCliente } from '@/app/actions/cliente-action';

interface ClienteEditFormProps {
    cliente: Cliente;
}

export default function ClienteEditForm({ cliente }: ClienteEditFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        celular: cliente.celular,
        direccion: cliente.direccion || '',
        email: cliente.email || '',
        latitud: cliente.latitud,
        longitud: cliente.longitud
    });

    // Función para obtener ubicación actual
    const obtenerUbicacionActual = () => {
        if ("geolocation" in navigator) {
            toast.info("Obteniendo ubicación...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitud: position.coords.latitude,
                        longitud: position.coords.longitude
                    });
                    toast.success("Ubicación obtenida correctamente");
                },
                (error) => {
                    console.error("Error al obtener ubicación:", error);
                    toast.error("No se pudo obtener la ubicación. Por favor, ingresa las coordenadas manualmente.");
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            toast.error("Tu navegador no soporta geolocalización");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.celular) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);

        const result = await actualizarCliente(cliente.id!, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            celular: formData.celular,
            direccion: formData.direccion,
            email: formData.email || undefined,
            latitud: formData.latitud,
            longitud: formData.longitud
        });

        setLoading(false);

        if (result.success) {
            toast.success('¡Cliente actualizado exitosamente!');
            setIsEditing(false);
            router.refresh(); // Refresca los datos del servidor
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
            email: cliente.email || '',
            latitud: cliente.latitud,
            longitud: cliente.longitud
        });
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCoordChange = (field: 'latitud' | 'longitud', value: string) => {
        setFormData({
            ...formData,
            [field]: value ? parseFloat(value) : undefined
        });
    };

    // MODO LECTURA
    if (!isEditing) {
        return (
            <div className="bg-white p-6 border border-border rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sz-md font-bold">Información del Cliente</h2>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary hover:underline text-sz-sm font-medium"
                    >
                        Editar
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-sz-xs text-muted uppercase font-bold">Nombre Completo</p>
                        <p className="text-sz-base">{cliente.nombre} {cliente.apellido}</p>
                    </div>
                    <div>
                        <p className="text-sz-xs text-muted uppercase font-bold">Celular</p>
                        <p className="text-sz-base">{cliente.celular}</p>
                    </div>
                    {cliente.email && (
                        <div>
                            <p className="text-sz-xs text-muted uppercase font-bold">Email</p>
                            <p className="text-sz-base">{cliente.email}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sz-xs text-muted uppercase font-bold">Dirección</p>
                        <p className="text-sz-base">{cliente.direccion || 'No especificada'}</p>
                    </div>

                    {/* Mostrar coordenadas GPS si existen */}
                    {(cliente.latitud !== undefined && cliente.longitud !== undefined) ? (
                        <div>
                            <p className="text-sz-xs text-muted uppercase font-bold mb-2">Ubicación GPS</p>
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded border border-border">
                                <div className="flex-1">
                                    <p className="text-sz-sm">
                                        <span className="font-semibold">Lat:</span> {cliente.latitud.toFixed(6)} |
                                        <span className="font-semibold ml-2">Lng:</span> {cliente.longitud.toFixed(6)}
                                    </p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sz-xs hover:bg-blue-600 transition"
                                >
                                    📍 Ver en mapa
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sz-xs text-muted uppercase font-bold mb-2">Ubicación GPS</p>
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                                <p className="text-sz-sm text-amber-700">
                                    ⚠️ Este cliente no tiene coordenadas GPS registradas
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // MODO EDICIÓN
    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sz-md font-bold">Editar Información</h2>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-muted hover:underline text-sz-sm"
                >
                    Cancelar
                </button>
            </div>

            <div className="space-y-4">
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

                {/* SECCIÓN DE COORDENADAS GPS */}
                <div className="p-4 bg-slate-50 rounded border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sz-sm font-semibold text-muted">Ubicación GPS</h3>
                        <button
                            type="button"
                            onClick={obtenerUbicacionActual}
                            className="text-sz-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition"
                        >
                            📍 Actualizar ubicación
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-sz-xs text-muted mb-1">Latitud</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="-17.7833"
                                className="w-full p-2 border border-border rounded text-sz-sm focus:border-primary outline-none"
                                value={formData.latitud ?? ''}
                                onChange={e => handleCoordChange('latitud', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sz-xs text-muted mb-1">Longitud</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="-63.1821"
                                className="w-full p-2 border border-border rounded text-sz-sm focus:border-primary outline-none"
                                value={formData.longitud ?? ''}
                                onChange={e => handleCoordChange('longitud', e.target.value)}
                            />
                        </div>
                    </div>

                    {formData.latitud !== undefined && formData.longitud !== undefined ? (
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                            <p className="text-sz-xs text-green-600">
                                ✓ Coordenadas: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
                            </p>
                            <a
                                href={`https://www.google.com/maps?q=${formData.latitud},${formData.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sz-xs text-blue-600 hover:underline"
                            >
                                Ver en mapa
                            </a>
                        </div>
                    ) : (
                        <p className="text-sz-xs text-amber-600">
                            ⚠️ Sin coordenadas GPS registradas
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-3 rounded hover:bg-primary-dark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
}