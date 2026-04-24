import { t, currentLang } from './i18n.js';
import { obtenerCategorias } from './categories.js';

export const WARNING_THRESHOLD = 0.2;

export function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

export function aplicarTraduccion(gastoEnEdicion) {
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = t(el.getAttribute('data-i18n')));
    document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.getAttribute('data-i18n-ph')));
    
    const btnGuardarGasto = document.getElementById('btn-guardar-gasto');
    if(btnGuardarGasto) {
        btnGuardarGasto.innerText = gastoEnEdicion ? t('btnEdit') : t('btnAdd');
    }
}

export function renderizarSelectCategorias(customCats) {
    const select = document.getElementById('input-categoria');
    const currentValue = select.value;
    select.innerHTML = '';
    
    const categorias = obtenerCategorias(customCats);
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.emoji} ${cat.nombre}`; 
        select.appendChild(option);
    });
    if(currentValue && categorias.find(c => c.id === currentValue)) select.value = currentValue;
}

export function actualizarInterfaz(state, mesActual, añoActual, hoy) {
    const localeStr = currentLang === 'es' ? 'es-ES' : (currentLang === 'pt' ? 'pt-BR' : 'en-US');
    const formatoDinero = new Intl.NumberFormat(localeStr, { style: 'currency', currency: state.monedaActual });
    const gastosMesActual = state.historialGlobal.filter(g => new Date(g.fecha).getMonth() === mesActual && new Date(g.fecha).getFullYear() === añoActual);
    const totalGastadoMes = gastosMesActual.reduce((acc, g) => acc + g.monto, 0);
    const dineroRestante = state.presupuestoMensual - totalGastadoMes;
    const diasRestantes = (new Date(añoActual, mesActual + 1, 0).getDate() - hoy.getDate()) + 1;
    const presupuestoDiario = dineroRestante / diasRestantes;
    
    const elDiario = document.getElementById('display-diario');
    const elMensual = document.getElementById('display-mensual');
    const elGastado = document.getElementById('display-gastado');
    const barraFill = document.getElementById('progreso-mensual-fill');

    elDiario.innerText = formatoDinero.format(presupuestoDiario);
    elMensual.innerText = formatoDinero.format(dineroRestante);
    elGastado.innerText = formatoDinero.format(totalGastadoMes);

    let porcentajeGastado = (totalGastadoMes / state.presupuestoMensual) * 100;
    if (porcentajeGastado > 100) porcentajeGastado = 100;
    barraFill.style.width = `${porcentajeGastado}%`;
    
    if (dineroRestante < (state.presupuestoMensual * WARNING_THRESHOLD)) { 
        barraFill.classList.add('warning'); 
        elDiario.style.color = "var(--danger-color)"; 
    } else { 
        barraFill.classList.remove('warning'); 
        elDiario.style.color = "var(--primary-color)"; 
    }

    const contGrafico = document.getElementById('grafico-categorias');
    const categoriasActuales = obtenerCategorias(state.categoriasCustom);

    if (gastosMesActual.length > 0) {
        const sumasPorCat = {};
        gastosMesActual.forEach(g => { sumasPorCat[g.categoria] = (sumasPorCat[g.categoria] || 0) + g.monto; });
        
        let graficoHTML = '';
        for (const catId in sumasPorCat) {
            if(catId === 'otros_previo') continue; 
            const porcentaje = (sumasPorCat[catId] / totalGastadoMes) * 100;
            const infoCat = categoriasActuales.find(c => c.id === catId) || { emoji: '📦', nombre: catId };
            
            graficoHTML += `
                <div class="cat-bar-container">
                    <div class="cat-bar-label" title="${escapeHTML(infoCat.nombre)}">${escapeHTML(infoCat.emoji)} ${escapeHTML(infoCat.nombre)}</div>
                    <div class="cat-bar-wrapper"><div class="cat-bar-fill" style="width: ${porcentaje}%"></div></div>
                    <div class="cat-bar-amount">${escapeHTML(formatoDinero.format(sumasPorCat[catId]))}</div>
                </div>
            `;
        }
        contGrafico.innerHTML = graficoHTML; 
    } else {
        contGrafico.innerHTML = `<p style="text-align:center; color: var(--text-muted); font-size: 0.85rem;">${escapeHTML(t('noExpenses'))}</p>`;
    }

    const listaUI = document.getElementById('lista-historial');
    if(gastosMesActual.length === 0) {
        listaUI.innerHTML = `<li style="color: var(--text-muted); justify-content:center; box-shadow: none; background: transparent; cursor: default;">${escapeHTML(t('noExpenses'))}</li>`;
    } else {
        let listaHTML = '';
        for (let i = gastosMesActual.length - 1; i >= 0; i--) {
            const g = gastosMesActual[i];
            const fechaStr = new Date(g.fecha).toLocaleString(localeStr, { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
            const infoCat = categoriasActuales.find(c => c.id === g.categoria) || { emoji: '📌', nombre: g.categoria };
            
            listaHTML += `
                <li>
                    <div class="cat-icon">${escapeHTML(infoCat.emoji)}</div>
                    <div class="expense-info">
                        <span class="expense-desc" title="${escapeHTML(g.desc)}">${escapeHTML(g.desc)}</span>
                        <span class="expense-cat">${escapeHTML(infoCat.nombre)}</span>
                        <span class="expense-date">${escapeHTML(fechaStr)}</span>
                    </div>
                    <div class="actions-row">
                        <span class="expense-amount" style="margin-right: 8px;">${escapeHTML(formatoDinero.format(g.monto))}</span>
                        <button class="edit-btn" data-id="${g.id}">✏️</button>
                        <button class="delete-btn" data-id="${g.id}">✕</button>
                    </div>
                </li>
            `;
        }
        listaUI.innerHTML = listaHTML; 
    }
}

export function resetFormularioGasto(setGastoCallback) {
    setGastoCallback(null);
    document.getElementById('input-monto').value = '';
    document.getElementById('input-desc').value = '';
    document.getElementById('btn-guardar-gasto').innerText = t('btnAdd');
}