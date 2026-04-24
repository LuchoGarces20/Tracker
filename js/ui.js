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
    
    const totalGastadoMesCents = gastosMesActual.reduce((acc, g) => acc + g.monto, 0);
    const dineroRestanteCents = state.presupuestoMensual - totalGastadoMesCents;
    const diasRestantes = (new Date(añoActual, mesActual + 1, 0).getDate() - hoy.getDate()) + 1;
    const presupuestoDiarioCents = Math.max(0, Math.floor(dineroRestanteCents / diasRestantes));
    
    const elDiario = document.getElementById('display-diario');
    const elMensual = document.getElementById('display-mensual');
    const elGastado = document.getElementById('display-gastado');
    const barraFill = document.getElementById('progreso-mensual-fill');

    elDiario.innerText = formatoDinero.format(presupuestoDiarioCents / 100);
    elMensual.innerText = formatoDinero.format(dineroRestanteCents / 100);
    elGastado.innerText = formatoDinero.format(totalGastadoMesCents / 100);

    let porcentajeGastado = (totalGastadoMesCents / state.presupuestoMensual) * 100;
    if (porcentajeGastado > 100 || isNaN(porcentajeGastado)) porcentajeGastado = 100;
    barraFill.style.width = `${porcentajeGastado}%`;
    
    if (dineroRestanteCents < (state.presupuestoMensual * WARNING_THRESHOLD)) { 
        barraFill.classList.add('warning'); 
        elDiario.style.color = "var(--danger-color)"; 
    } else { 
        barraFill.classList.remove('warning'); 
        elDiario.style.color = "var(--primary-color)"; 
    }

    const contGrafico = document.getElementById('grafico-categorias');
    const categoriasActuales = obtenerCategorias(state.categoriasCustom);
    
    contGrafico.innerHTML = ''; 
    if (gastosMesActual.length > 0) {
        const sumasPorCatCents = {};
        gastosMesActual.forEach(g => { sumasPorCatCents[g.categoria] = (sumasPorCatCents[g.categoria] || 0) + g.monto; });
        
        const fragChart = document.createDocumentFragment();
        for (const catId in sumasPorCatCents) {
            if(catId === 'otros_previo') continue; 
            const porcentaje = (sumasPorCatCents[catId] / totalGastadoMesCents) * 100;
            const infoCat = categoriasActuales.find(c => c.id === catId) || { emoji: '📦', nombre: catId };
            
            const el = document.createElement('div');
            el.className = 'cat-bar-container';
            el.innerHTML = `
                <div class="cat-bar-label" title="${escapeHTML(infoCat.nombre)}">${escapeHTML(infoCat.emoji)} ${escapeHTML(infoCat.nombre)}</div>
                <div class="cat-bar-wrapper"><div class="cat-bar-fill" style="width: ${porcentaje}%"></div></div>
                <div class="cat-bar-amount">${escapeHTML(formatoDinero.format(sumasPorCatCents[catId] / 100))}</div>
            `;
            fragChart.appendChild(el);
        }
        contGrafico.appendChild(fragChart);
    } else {
        const p = document.createElement('p');
        p.className = 'no-expenses-text';
        p.textContent = t('noExpenses');
        contGrafico.appendChild(p);
    }

    const listaUI = document.getElementById('lista-historial');
    listaUI.innerHTML = '';
    
    if(gastosMesActual.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-expenses-li';
        li.textContent = t('noExpenses');
        listaUI.appendChild(li);
    } else {
        const fragList = document.createDocumentFragment();
        for (let i = gastosMesActual.length - 1; i >= 0; i--) {
            const g = gastosMesActual[i];
            const fechaStr = new Date(g.fecha).toLocaleString(localeStr, { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
            const infoCat = categoriasActuales.find(c => c.id === g.categoria) || { emoji: '📌', nombre: g.categoria };
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="cat-icon">${escapeHTML(infoCat.emoji)}</div>
                <div class="expense-info">
                    <span class="expense-desc" title="${escapeHTML(g.desc)}">${escapeHTML(g.desc)}</span>
                    <span class="expense-cat">${escapeHTML(infoCat.nombre)}</span>
                    <span class="expense-date">${escapeHTML(fechaStr)}</span>
                </div>
                <div class="actions-row">
                    <span class="expense-amount" style="margin-right: 8px;">${escapeHTML(formatoDinero.format(g.monto / 100))}</span>
                    <button class="edit-btn" data-id="${g.id}">✏️</button>
                    <button class="delete-btn" data-id="${g.id}">✕</button>
                </div>
            `;
            fragList.appendChild(li);
        }
        listaUI.appendChild(fragList);
    }
}

export function resetFormularioGasto(setGastoCallback) {
    setGastoCallback(null);
    document.getElementById('input-monto').value = '';
    document.getElementById('input-desc').value = '';
    document.getElementById('btn-guardar-gasto').innerText = t('btnAdd');
}