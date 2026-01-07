import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ mensaje: "Dime tu nombre usando un POST" });
}

export async function POST(request: Request) {
    const body = await request.json();
    const nombre = body.nombre || "Desconocido";

    return NextResponse.json({
        respuesta: `Hola ${nombre}, este mensaje viene desde el servidor.`
    });
}