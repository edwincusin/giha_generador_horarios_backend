// ==========================================
// Factorial: n! = n × (n-1) × (n-2) × ... × 1
// ==========================================
export function factorialIterativa(number: number): number {
    let result = 1;
    for (let value = 2; value <= number; value++) {
        result *= value;
    }
    return result;
}

// ==========================================
// C(n,r) = n! / (r! × (n-r)!)
// Calcula CUÁNTAS combinaciones existen, sin generarlas
// ==========================================
export function calculateCombinationCount(n: number, r: number): number {
    if (r < 0 || r > n) {
        return 0;
    }
    return factorialIterativa(n) / (factorialIterativa(r) * factorialIterativa(n - r));
}

// ==========================================
// Genera TODAS las combinaciones reales (no solo el número)
// La fórmula permite calcular cuántas combinaciones existen, pero no muestra cuáles son.
// ==========================================
export function generarCombinaciones<T>(elementos: T[], cantidadSeleccionar: number): T[][] {

    // Aquí se guardarán todas las combinaciones
    const resultados: T[][] = [];

    function combinar(indiceInicio: number, combinacionActual: T[]): void {

        // Si ya tenemos la cantidad deseada,
        // guardamos una copia de la combinación
        if (combinacionActual.length === cantidadSeleccionar) {
            resultados.push([...combinacionActual]);
            return;
        }

        // Recorremos los elementos disponibles
        for (let indice = indiceInicio; indice < elementos.length; indice++) {

            // Agregamos un elemento
            combinacionActual.push(elementos[indice]!);

            // Llamada recursiva
            combinar(indice + 1, combinacionActual);

            // Eliminamos el último elemento
            // para probar otra combinación
            combinacionActual.pop();
        }
    }

    combinar(0, []);

    return resultados;
}