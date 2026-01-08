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

export interface Order {
    id?: string;
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

export interface Cliente {
    nombre: string;
    apellido: string;
    celular: string;
    direccion: string;
}

