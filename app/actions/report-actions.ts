'use client';

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cliente, Product, Order } from "@/types/database";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const getReportData = async () => {
    const pedidosQuery = query(collection(db, 'pedidos'), where("estado", "!=", "cancelado"));
    const pedidosSnap = await getDocs(pedidosQuery);

    const productosSnap = await getDocs(collection(db, 'productos'));

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


export const generateReport = async (isPdf: boolean) => {
    const { productos, matrix, clients } = await getReportData();

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