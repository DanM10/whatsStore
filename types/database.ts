export type OrderStatus = 'abierto' | 'cerrado' | 'cancelado';

export interface Product {
    id?: string;
    codigo: string; // <-- Nuevo campo (ej: pr-001)
    nombre: string;
    precio: number;
    stock: number;
    descripcion: string;
}

export interface OrderItem {
    productoId: string;
    nombre: string;
    precio: number; // Precio al momento de la compra
    cantidad: number;
}

export interface Cliente {
    id?: string;
    nombre: string;
    apellido: string;
    celular: string;
    direccion: string;
    email?: string; // Opcional
    fechaRegistro?: any; // Timestamp de Firestore
    totalPedidos?: number; // Contador de pedidos
    totalGastado?: number; // Total acumulado
}

export interface Order {
    id?: string;
    clienteId: string;
    cliente: Cliente;
    items: OrderItem[];
    total: number;
    estado: OrderStatus;
    motivoCancelacion?: string;
    fechas: {
        creado: any;
        cerrado?: any;
        cancelado?: any;
    };
}