export const state = {
    presupuestoMensual: 0,
    historialGlobal: [],
    monedaActual: 'BRL',
    categoriasCustom: []
};

export function loadStore() {
    const p = localStorage.getItem('floux_presupuesto_v8');
    const h = localStorage.getItem('floux_historial_v8');
    const m = localStorage.getItem('floux_moneda');
    const c = localStorage.getItem('floux_categorias_custom');

    if (m) state.monedaActual = m;
    
    if (c) {
        try { state.categoriasCustom = JSON.parse(c) || []; }
        catch (e) { console.error("Failed to parse custom categories."); }
    }
    
    if (p) {
        state.presupuestoMensual = parseFloat(p);
        try {
            const parsedHistorial = JSON.parse(h);
            if (isValidoHistorialSchema(parsedHistorial)) {
                state.historialGlobal = parsedHistorial;
            }
        } catch (e) {
            console.error("Failed to parse history data.");
        }
        return true; 
    }
    return false;
}

export function saveStore() {
    localStorage.setItem('floux_presupuesto_v8', state.presupuestoMensual);
    localStorage.setItem('floux_historial_v8', JSON.stringify(state.historialGlobal));
    localStorage.setItem('floux_moneda', state.monedaActual);
    localStorage.setItem('floux_categorias_custom', JSON.stringify(state.categoriasCustom));
}

export function isValidoHistorialSchema(data) {
    if (!Array.isArray(data)) return false;
    return data.every(item => 
        typeof item === 'object' && item !== null &&
        typeof item.id === 'number' &&
        typeof item.monto === 'number' &&
        typeof item.desc === 'string' &&
        typeof item.fecha === 'string' &&
        typeof item.categoria === 'string'
    );
}