"use client"; // Necesario porque usaremos estados (useState) y eventos (onClick)
import { useState } from 'react';

export default function UsuariosPage() {
    const [nombre, setNombre] = useState("");
    const [mensaje, setMensaje] = useState("");

    const enviarDato = async () => {
        const res = await fetch('/api/hello', {
            method: 'POST',
            body: JSON.stringify({ nombre }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        setMensaje(data.respuesta);
    };

    return (
        <div className="p-10 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Prueba de API interna</h1>

            <input
                type="text"
                placeholder="Escribe tu nombre"
                className="border p-2 text-black"
                onChange={(e) => setNombre(e.target.value)}
            />

            <button
                onClick={enviarDato}
                className="bg-blue-500 text-white p-2 rounded"
            >
                Enviar al Servidor
            </button>

            {mensaje && <p className="mt-4 text-green-600 font-medium">{mensaje}</p>}
        </div>
    );
}