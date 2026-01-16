"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, OrderItem, Cliente } from "@/types/database";
import { crearNuevoPedido } from "@/app/actions/pedido-actions";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

export default function NuevoPedidoPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Product[]>([]);
    const [carrito, setCarrito] = useState<OrderItem[]>([]);
    const [celularBusqueda, setCelularBusqueda] = useState("");
    const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [cliente, setCliente] = useState<Omit<Cliente, 'id' | 'fechaRegistro' | 'totalPedidos' | 'totalGastado'>>({
        nombre: "",
        apellido: "",
        celular: "",
        direccion: "",
        email: "",
        latitud: undefined,
        longitud: undefined
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProds = async () => {
            try {
                const snap = await getDocs(collection(db, "productos"));
                setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProds();
    }, []);

    const buscarClientePorCelular = async () => {
        if (!celularBusqueda.trim()) {
            toast.error("Ingresa un número de celular");
            return;
        }

        setBuscandoCliente(true);
        try {
            const q = query(collection(db, "clientes"), where("celular", "==", celularBusqueda.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const clienteDoc = querySnapshot.docs[0];
                const clienteData = { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;
                setClienteEncontrado(clienteData);
                setCliente({
                    nombre: clienteData.nombre,
                    apellido: clienteData.apellido,
                    celular: clienteData.celular,
                    direccion: clienteData.direccion || "",
                    email: clienteData.email || "",
                    latitud: clienteData.latitud,
                    longitud: clienteData.longitud
                });
                toast.success("¡Cliente encontrado!");
            } else {
                setClienteEncontrado(null);
                setCliente({
                    nombre: "",
                    apellido: "",
                    celular: celularBusqueda.trim(),
                    direccion: "",
                    email: "",
                    latitud: undefined,
                    longitud: undefined
                });
                toast.info("Cliente no encontrado. Completa los datos para crear uno nuevo.");
            }
        } catch (error) {
            console.error("Error buscando cliente:", error);
            toast.error("Error al buscar cliente");
        } finally {
            setBuscandoCliente(false);
        }
    };

    const limpiarFormularioCliente = () => {
        setCelularBusqueda("");
        setClienteEncontrado(null);
        setCliente({
            nombre: "",
            apellido: "",
            celular: "",
            direccion: "",
            email: "",
            latitud: undefined,
            longitud: undefined
        });
    };

    // Función para obtener ubicación actual
    const obtenerUbicacionActual = () => {
        if ("geolocation" in navigator) {
            toast.info("Obteniendo ubicación...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCliente({
                        ...cliente,
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

    if (loading) return <p>Cargando formulario...</p>;

    const agregarAlCarrito = (p: Product) => {
        setCarrito(prev => {
            const existe = prev.find(item => item.productoId === p.id);
            if (existe) {
                return prev.map(item =>
                    item.productoId === p.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { productoId: p.id!, nombre: p.nombre, precio: p.precio, cantidad: 1 }];
        });
        toast.success(`${p.nombre} añadido al carrito`);
    };

    const eliminarDelCarrito = (productoId: string) => {
        setCarrito(prev => prev.filter(item => item.productoId !== productoId));
    };

    const actualizarCantidad = (productoId: string, cantidad: number) => {
        if (cantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }
        setCarrito(prev =>
            prev.map(item =>
                item.productoId === productoId ? { ...item, cantidad } : item
            )
        );
    };

    const handleCrearPedido = async () => {
        if (carrito.length === 0) {
            return toast.error("Añade al menos un producto al carrito");
        }
        if (!cliente.nombre || !cliente.apellido || !cliente.celular) {
            return toast.error("Por favor completa los datos del cliente (nombre, apellido y celular son obligatorios)");
        }

        const res = await crearNuevoPedido(cliente, carrito);
        if (res.success) {
            toast.success(clienteEncontrado
                ? "¡Pedido creado exitosamente!"
                : "¡Cliente creado y pedido registrado!"
            );
            router.push("/pedidos");
        } else {
            toast.error(res.error || "Hubo un error al crear el pedido");
        }
    };

    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECCIÓN IZQUIERDA: PRODUCTOS */}
            <div>
                <h2 className="text-sz-lg font-bold mb-4">Seleccionar Productos</h2>
                <div className="grid grid-cols-1 gap-4">
                    {productos.map(p => (
                        <div key={p.id}
                             className="border border-border p-4 rounded flex justify-between items-center bg-white">
                            <div>
                                <p className="font-bold">{p.nombre}</p>
                                <p className="text-muted text-sz-sm">${p.precio}</p>
                                <p className="text-sz-xs text-muted">Stock: {p.stock}</p>
                            </div>
                            <button
                                onClick={() => agregarAlCarrito(p)}
                                className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark"
                            >
                                + Añadir
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECCIÓN DERECHA: DATOS CLIENTE Y RESUMEN */}
            <div className="bg-slate-50 p-6 rounded-lg border border-border">
                {/* BÚSQUEDA DE CLIENTE */}
                <div className="mb-6 pb-6 border-b border-border">
                    <h2 className="text-sz-lg font-bold mb-4">Buscar Cliente</h2>
                    <div className="flex gap-2">
                        <input
                            placeholder="Número de celular"
                            value={celularBusqueda}
                            onChange={e => setCelularBusqueda(e.target.value)}
                            className="flex-1 p-2 border rounded"
                            onKeyPress={e => e.key === 'Enter' && buscarClientePorCelular()}
                        />
                        <button
                            onClick={buscarClientePorCelular}
                            disabled={buscandoCliente}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {buscandoCliente ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                    {(clienteEncontrado || celularBusqueda) && (
                        <button
                            onClick={limpiarFormularioCliente}
                            className="mt-2 text-sz-sm text-muted hover:underline"
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>

                {/* DATOS DEL CLIENTE */}
                <h2 className="text-sz-lg font-bold mb-4">
                    {clienteEncontrado ? "Cliente Encontrado" : "Datos del Cliente"}
                </h2>

                {clienteEncontrado && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                        <p className="text-sz-sm text-green-800 font-medium">
                            ✓ Cliente existente: {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                        </p>
                        <p className="text-sz-xs text-green-700">
                            Total pedidos: {clienteEncontrado.totalPedidos || 0} |
                            Total gastado: ${(clienteEncontrado.totalGastado || 0).toFixed(2)}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        placeholder="Nombre *"
                        value={cliente.nombre}
                        className="p-2 border rounded"
                        onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                        disabled={!!clienteEncontrado}
                    />
                    <input
                        placeholder="Apellido *"
                        value={cliente.apellido}
                        className="p-2 border rounded"
                        onChange={e => setCliente({ ...cliente, apellido: e.target.value })}
                        disabled={!!clienteEncontrado}
                    />
                    <input
                        placeholder="Celular *"
                        value={cliente.celular}
                        className="p-2 border rounded"
                        onChange={e => setCliente({ ...cliente, celular: e.target.value })}
                        disabled={!!clienteEncontrado}
                    />
                    <input
                        placeholder="Email"
                        value={cliente.email}
                        className="p-2 border rounded"
                        onChange={e => setCliente({ ...cliente, email: e.target.value })}
                        disabled={!!clienteEncontrado}
                    />
                    <input
                        placeholder="Dirección"
                        value={cliente.direccion}
                        className="p-2 border rounded col-span-2"
                        onChange={e => setCliente({ ...cliente, direccion: e.target.value })}
                        disabled={!!clienteEncontrado}
                    />
                </div>

                {/* SECCIÓN DE COORDENADAS GPS */}
                <div className="mb-6 p-4 bg-white rounded border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sz-sm font-semibold text-muted">Ubicación GPS</h3>
                        <button
                            type="button"
                            onClick={obtenerUbicacionActual}
                            disabled={!!clienteEncontrado}
                            className="text-sz-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            📍 Usar mi ubicación
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sz-xs text-muted mb-1">Latitud</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="-17.7833"
                                className="w-full p-2 border rounded text-sz-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={cliente.latitud ?? ''}
                                onChange={e => setCliente({
                                    ...cliente,
                                    latitud: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                disabled={!!clienteEncontrado}
                            />
                        </div>
                        <div>
                            <label className="block text-sz-xs text-muted mb-1">Longitud</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="-63.1821"
                                className="w-full p-2 border rounded text-sz-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={cliente.longitud ?? ''}
                                onChange={e => setCliente({
                                    ...cliente,
                                    longitud: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                disabled={!!clienteEncontrado}
                            />
                        </div>
                    </div>

                    {cliente.latitud !== undefined && cliente.longitud !== undefined && (
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-sz-xs text-green-600">
                                ✓ Coordenadas: {cliente.latitud.toFixed(6)}, {cliente.longitud.toFixed(6)}
                            </p>
                            <a
                                href={`https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sz-xs text-blue-600 hover:underline"
                            >
                                Ver en mapa
                            </a>
                        </div>
                    )}

                    {clienteEncontrado && (cliente.latitud === undefined || cliente.longitud === undefined) && (
                        <p className="text-sz-xs text-amber-600 mt-2">
                            ⚠️ Este cliente no tiene coordenadas GPS registradas
                        </p>
                    )}
                </div>

                {/* RESUMEN DEL CARRITO */}
                <h2 className="text-sz-md font-bold mb-2">Resumen del Pedido</h2>
                <div className="mb-4 max-h-60 overflow-y-auto">
                    {carrito.length === 0 ? (
                        <p className="text-sz-sm text-muted text-center py-4">
                            No hay productos en el carrito
                        </p>
                    ) : (
                        carrito.map(item => (
                            <div key={item.productoId} className="flex justify-between items-center text-sz-sm border-b py-2">
                                <div className="flex-1">
                                    <span className="font-medium">{item.nombre}</span>
                                    <p className="text-sz-xs text-muted">${item.precio} c/u</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                                        className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                                    <button
                                        onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                                        className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                    <span className="w-16 text-right font-bold">${(item.precio * item.cantidad).toFixed(2)}</span>
                                    <button
                                        onClick={() => eliminarDelCarrito(item.productoId)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <div className="flex justify-between font-bold text-sz-md mt-4 text-primary">
                        <span>TOTAL:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCrearPedido}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                    {clienteEncontrado ? "Confirmar Pedido" : "Crear Cliente y Confirmar Pedido"}
                </button>
            </div>
        </div>
    );
}