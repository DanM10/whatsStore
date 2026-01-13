'use client';

import { useState } from "react";
import { generateReport } from "@/app/actions/report-actions";
import { toast } from "sonner";

export default function ReportButtons() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPdf, setIsPdf] = useState(false);
    const [dates, setDates] = useState({ start: '', end: '' });

    const handleConfirm = async () => {
        if (!dates.start || !dates.end) {
            toast.error("Por favor, selecciona el rango de fechas");
            return;
        }

        try {
            setIsOpen(false);
            const formatName = isPdf ? 'PDF' : 'Excel';
            toast.info(`Generando reporte en ${formatName}...`);

            await generateReport(isPdf, dates.start, dates.end);

            toast.success(`Reporte ${formatName} generado`);
        } catch (e) {
            toast.error("Error al generar el reporte");
            console.error(e);
        }
    };

    return (
        <div className="p-4">
            {/* Botón único de apertura */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                <span>Generar Reporte</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Opciones de Exportación</h3>

                        <div className="space-y-4">
                            {/* Switch de Formato */}
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">
                                    Formato: <span className="font-bold text-blue-600">{isPdf ? 'PDF' : 'Excel'}</span>
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isPdf}
                                        onChange={() => setIsPdf(!isPdf)}
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Inputs de Fechas */}
                            <div className="grid gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Desde</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => setDates({...dates, start: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Hasta</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => setDates({...dates, end: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all"
                            >
                                Descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}