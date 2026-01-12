'use client';

import {generateReport} from "@/app/actions/report-actions";
import {toast} from "sonner";

export default function ReportButtons() {

    const handleExcel = async (isPdf:boolean) => {
        try {
            toast.success("Generando reporte Excel...");
            await generateReport(isPdf)
        }catch (e) {
            toast.error("Error al generar el reporte Excel");
            console.error(e)
        }
    };


    return (
        <div className="col-auto gap-4 p-4">
            <button
                onClick={()=>handleExcel(false)}
                className="p-2 hover:bg-slate-100 rounded text-sz-base"
            >
                Exportar Excel
            </button>
            <button
                onClick={()=>handleExcel(true)}
                className="p-2 hover:bg-slate-100 rounded text-sz-base"
            >
                Exportar PDF
            </button>
        </div>
    );
}