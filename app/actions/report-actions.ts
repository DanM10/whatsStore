'use client';

import { db } from "@/lib/firebase";
import { Cliente, Product, Order } from "@/types/database";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { query, collection, where, getDocs, Timestamp, orderBy } from "firebase/firestore";

export const getReportData = async (startDate?: string, endDate?: string) => {
    const pedidosRef = collection(db, 'pedidos');
    let q;

    if (startDate && endDate) {
        // Creamos los límites del día
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        q = query(
            pedidosRef,
            where("fechas.creado", ">=", Timestamp.fromDate(start)),
            where("fechas.creado", "<=", Timestamp.fromDate(end)),
            orderBy("fechas.creado", "asc")
        );
    } else {
        q = query(pedidosRef, where("estado", "!=", "cancelado"));
    }

    const [pedidosSnap, productosSnap] = await Promise.all([
        getDocs(q),
        getDocs(collection(db, 'productos'))
    ]);

    const pedidos = pedidosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    const productos = productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    const matrix: SalesMatrix = {};
    const clientMap: Record<string, Cliente> = {};

    pedidos.forEach(pedido => {
        if (!matrix[pedido.clienteId]) {
            matrix[pedido.clienteId] = {};
            clientMap[pedido.clienteId] = { ...pedido.cliente, id: pedido.clienteId };
        }

        pedido.items.forEach(item => {
            matrix[pedido.clienteId][item.productoId] =
                (matrix[pedido.clienteId][item.productoId] || 0) + item.cantidad;
        });
    });

    return { productos, matrix, clients: Object.values(clientMap) };
};

export const generateReport = async (isPdf: boolean, startDate: string, endDate: string) => {
    const { productos, matrix, clients } = await getReportData(startDate, endDate);

    if (isPdf) {
        exportToPDF(productos, clients, matrix);
    } else {
        exportToExcel(productos, clients, matrix);
    }
};

export const exportToExcel = (productos: Product[], clients: Cliente[], matrix: SalesMatrix) => {
    const rows: ExcelRow[] = clients.map(client => {
        const rowData: ExcelRow = { "Cliente": `${client.nombre} ${client.apellido}` };

        productos.forEach(prod => {
            const prodId = prod.id || "";
            rowData[prod.nombre] = matrix[client.id!]?.[prodId] || 0;
        });
        return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    XLSX.writeFile(workbook, "Reporte_Ventas.xlsx");
};

export const exportToPDF = (productos: Product[], clients: Cliente[], matrix: SalesMatrix) => {
    const doc = new jsPDF('landscape');
    const tableHeaders = [["Cliente", ...productos.map(p => p.nombre)]];

    const tableRows = clients.map(client => [
        `${client.nombre} ${client.apellido}`,
        ...productos.map(prod => (matrix[client.id!]?.[prod.id!] || 0).toString())
    ]);

    autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: {
            fontSize: 8,
            overflow: 'linebreak'
        },
        headStyles: { fillColor: [44, 62, 80] }
    });

    doc.save("Reporte_Ventas.pdf");
};