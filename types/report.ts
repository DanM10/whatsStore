type ExcelRow = {
    Cliente: string;
    [key: string]: string | number;
};

// Tipo para la matriz de datos
type SalesMatrix = Record<string, Record<string, number>>;