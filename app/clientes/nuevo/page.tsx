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
        email: '',
        latitud: undefined as number | undefined,
        longitud: undefined as number | undefined
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

        const result = await crearCliente({
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

    const handleCoordChange = (field: 'latitud' | 'longitud', value: string) => {
        setFormData({
            ...formData,
            [field]: value ? parseFloat(value) : undefined
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

                {/* SECCIÓN DE COORDENADAS GPS */}
                <div className="p-4 bg-slate-50 rounded border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sz-sm font-semibold text-muted">Ubicación GPS (Opcional)</h3>
                        <button
                            type="button"
                            onClick={obtenerUbicacionActual}
                            className="text-sz-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition"
                        >
                            📍 Usar mi ubicación
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

                    {formData.latitud !== undefined && formData.longitud !== undefined && (
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
                    )}

                    <p className="text-sz-xs text-muted mt-2">
                        💡 Las coordenadas GPS ayudan a optimizar las rutas de entrega
                    </p>
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