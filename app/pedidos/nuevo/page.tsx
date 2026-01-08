"use client";
import {useState, useEffect} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {Product, OrderItem, Cliente} from "@/types/database";
import {crearNuevoPedido} from "@/app/actions/pedido-actions";
import {useRouter} from 'next/navigation';
import {toast} from "sonner";

export default function NuevoPedidoPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Product[]>([]);
    const [carrito, setCarrito] = useState<OrderItem[]>([]);
    const [cliente, setCliente] = useState<Cliente>({
        nombre: "", apellido: "", celular: "", direccion: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProds = async () => {
            try {
                const snap = await getDocs(collection(db, "productos"));
                setProductos(snap.docs.map(d => ({id: d.id, ...d.data()} as Product)));
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false); // Deja de cargar aunque falle
            }
        };
        fetchProds();
    }, []);

    if (loading) return <p>Cargando formulario...</p>;

    const agregarAlCarrito = (p: Product) => {
        setCarrito(prev => {
            const existe = prev.find(item => item.productoId === p.id);
            if (existe) {
                return prev.map(item =>
                    item.productoId === p.id ? {...item, cantidad: item.cantidad + 1} : item
                );
            }
            return [...prev, {productoId: p.id!, nombre: p.nombre, precio: p.precio, cantidad: 1}];
        });
    };

    const handleCrearPedido = async () => {
        if (carrito.length === 0 || !cliente.nombre) {
            return toast.error("Por favor completa los datos del cliente y añade productos.");
        }
        const res = await crearNuevoPedido(cliente, carrito);
        if (res.success) {
            toast.success("¡Pedido creado exitosamente!");
            router.push("/pedidos");
        } else {
            toast.error("Hubo un error al crear el pedido.");
        }
    }
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
                <h2 className="text-sz-lg font-bold mb-4">Datos del Cliente</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <input placeholder="Nombre" className="p-2 border rounded"
                           onChange={e => setCliente({...cliente, nombre: e.target.value})}/>
                    <input placeholder="Apellido" className="p-2 border rounded"
                           onChange={e => setCliente({...cliente, apellido: e.target.value})}/>
                    <input placeholder="Celular" className="p-2 border rounded"
                           onChange={e => setCliente({...cliente, celular: e.target.value})}/>
                    <input placeholder="Dirección" className="p-2 border rounded col-span-2"
                           onChange={e => setCliente({...cliente, direccion: e.target.value})}/>
                </div>

                <h2 className="text-sz-md font-bold mb-2">Resumen</h2>
                <div className="mb-4">
                    {carrito.map(item => (
                        <div key={item.productoId} className="flex justify-between text-sz-sm border-b py-1">
                            <span>{item.cantidad}x {item.nombre}</span>
                            <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-sz-md mt-4 text-primary">
                        <span>TOTAL:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleCrearPedido}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                    Confirmar Pedido
                </button>
            </div>
        </div>
    );

}