"use client";
import { useActionState } from 'react';
import {registrarUsuario} from "@/app/actions/actions"; // Hook moderno de React/Next.js

export default function RegistroPage() {
    // state tendrá lo que retorne tu función (success, message)
    // formAction es lo que pondrás en el formulario
    const [state, formAction, isPending] = useActionState(registrarUsuario, null);

    return (
        <div className="p-10">
            <form action={formAction} className="flex flex-col gap-4">
                <input name="nombre" placeholder="Nombre" className="border p-2 text-black" />
                <input name="email" placeholder="Email" className="border p-2 text-black" />

                <button
                    disabled={isPending}
                    className="bg-blue-500 p-2 text-white disabled:bg-gray-400"
                >
                    {isPending ? "Guardando..." : "Registrar"}
                </button>
            </form>

            {/* Mostramos el mensaje que viene del servidor */}
            {state?.message && (
                <p className={`mt-4 ${state.success ? 'text-green-500' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
        </div>
    );
}