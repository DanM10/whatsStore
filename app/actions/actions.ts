// src/app/actions.ts
'use server';

// Definimos un tipo para la respuesta
export type FormState = {
    success: boolean;
    message: string;
} | null;

// IMPORTANTE: Debe recibir 'prevState' como primer argumento
export async function registrarUsuario(prevState: FormState, formData: FormData): Promise<FormState> {
    const nombre = formData.get('nombre');

    // Tu lógica aquí...
    console.log("Procesando:", nombre);

    return {
        success: true,
        message: `¡Usuario ${nombre} creado con éxito!`
    };
}