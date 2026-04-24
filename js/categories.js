import { t } from './i18n.js';

export function getCategoriasPorDefecto() {
    return [
        { id: 'comida', emoji: '🍔', nombre: t('cat_comida') },
        { id: 'transporte', emoji: '🚕', nombre: t('cat_transporte') },
        { id: 'supermercado', emoji: '🛒', nombre: t('cat_supermercado') },
        { id: 'cuentas', emoji: '💡', nombre: t('cat_cuentas') },
        { id: 'ocio', emoji: '🎉', nombre: t('cat_ocio') },
        { id: 'otros', emoji: '📦', nombre: t('cat_otros') }
    ];
}

export function obtenerCategorias(customCats) { 
    return [...getCategoriasPorDefecto(), ...customCats]; 
}