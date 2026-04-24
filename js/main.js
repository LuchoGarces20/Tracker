import { state, loadStore, saveStore, isValidoHistorialSchema, STORAGE_KEYS } from './store.js';
import { currentLang, t, setLangStr } from './i18n.js';
import { aplicarTraduccion, renderizarSelectCategorias, actualizarInterfaz, resetFormularioGasto } from './ui.js';

let gastoEnEdicion = null;
const setGastoEnEdicion = (val) => { gastoEnEdicion = val; };

const hoy = new Date();
const mesActual = hoy.getMonth();
const añoActual = hoy.getFullYear();

let modoActual = 'directo';
let presupuestoCalculadoTemporalCents = 0;

// Cached DOM Elements
const inputIngresos = document.getElementById('input-ingresos');
const inputFijos = document.getElementById('input-fijos');
const inputInversiones = document.getElementById('input-inversiones');
const displayCalculado = document.getElementById('display-calculado');
const inputMoneda = document.getElementById('input-moneda');
const inputPresupuesto = document.getElementById('input-presupuesto');

const lsimMonto = document.getElementById('input-lsim-monto');
const lsimAnos = document.getElementById('input-lsim-anos');
const lsimTasa = document.getElementById('input-lsim-tasa');
const lsimResultado = document.getElementById('display-lsim-resultado');

// Application Initialization
function init() {
    const hasData = loadStore();
    inputMoneda.value = state.monedaActual;
    
    const activeFlag = document.querySelector(`.flag[data-lang="${currentLang}"]`);
    if (activeFlag) activeFlag.classList.add('active');

    aplicarTraduccion(gastoEnEdicion);
    renderizarSelectCategorias(state.categoriasCustom);

    if (hasData) {
        if (localStorage.getItem(STORAGE_KEYS.MES_GUARDADO) === null || parseInt(localStorage.getItem(STORAGE_KEYS.MES_GUARDADO)) !== mesActual) {
            localStorage.setItem(STORAGE_KEYS.MES_GUARDADO, mesActual);
        }
        mostrarPantallaPrincipal();
    }
}

function mostrarPantallaPrincipal() {
    document.getElementById('pantalla-configuracion').classList.add('oculto');
    document.getElementById('pantalla-principal').classList.remove('oculto');
    document.getElementById('btn-editar-presupuesto').classList.remove('oculto');
    actualizarInterfaz(state, mesActual, añoActual, hoy);
}

function guardarYMostrar() {
    saveStore();
    mostrarPantallaPrincipal();
}

// Event Listeners - Navigation & Setup
document.getElementById('lang-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('flag')) {
        setLangStr(e.target.getAttribute('data-lang'));
        document.querySelectorAll('.flag').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        aplicarTraduccion(gastoEnEdicion);
        renderizarSelectCategorias(state.categoriasCustom);
        if(!document.getElementById('pantalla-principal').classList.contains('oculto')) {
            actualizarInterfaz(state, mesActual, añoActual, hoy);
        }
    }
});

const tabDirecto = document.getElementById('tab-directo');
const tabCalc = document.getElementById('tab-calc');
const modoDirecto = document.getElementById('modo-directo');
const modoCalculadora = document.getElementById('modo-calculadora');

tabDirecto.addEventListener('click', () => { 
    modoActual = 'directo'; tabDirecto.classList.add('active'); tabCalc.classList.remove('active'); 
    modoDirecto.classList.remove('oculto'); modoCalculadora.classList.add('oculto'); 
});

tabCalc.addEventListener('click', () => { 
    modoActual = 'calculadora'; tabCalc.classList.add('active'); tabDirecto.classList.remove('active'); 
    modoCalculadora.classList.remove('oculto'); modoDirecto.classList.add('oculto'); 
});

document.querySelectorAll('.input-calc').forEach(input => {
    input.addEventListener('input', () => {
        const i = Math.round((parseFloat(inputIngresos.value) || 0) * 100);
        const f = Math.round((parseFloat(inputFijos.value) || 0) * 100);
        const v = Math.round((parseFloat(inputInversiones.value) || 0) * 100);

        presupuestoCalculadoTemporalCents = Math.max(0, i - f - v);
        const localeStr = currentLang === 'es' ? 'es-ES' : (currentLang === 'pt' ? 'pt-BR' : 'en-US');
        displayCalculado.innerText = new Intl.NumberFormat(localeStr, { style: 'currency', currency: inputMoneda.value }).format(presupuestoCalculadoTemporalCents / 100);
    });
});

document.getElementById('btn-comenzar').addEventListener('click', () => {
    const inputVal = parseFloat(inputPresupuesto.value);
    const presupuestoDirectoCents = Math.round((isNaN(inputVal) ? 0 : inputVal) * 100);
    
    state.presupuestoMensual = modoActual === 'directo' ? presupuestoDirectoCents : presupuestoCalculadoTemporalCents;
    state.monedaActual = inputMoneda.value; 
    
    if (state.presupuestoMensual <= 0) {
        alert(t('errorBudget'));
        return;
    }

    if (!document.getElementById('area-gastos-previos').classList.contains('oculto')) {
        const inputInicial = parseFloat(document.getElementById('input-gastos-iniciales').value);
        const inicialCents = Math.round((isNaN(inputInicial) ? 0 : inputInicial) * 100);
        if (inicialCents > 0) state.historialGlobal.push({ id: Date.now(), monto: inicialCents, desc: t('prevExpense'), fecha: new Date().toISOString(), categoria: 'otros_previo' });
    }

    localStorage.setItem(STORAGE_KEYS.MES_GUARDADO, mesActual); 
    guardarYMostrar();
});

// Event Listeners - CRUD Operations
document.getElementById('form-gasto').addEventListener('submit', (e) => {
    e.preventDefault(); 
    const monto = parseFloat(document.getElementById('input-monto').value);
    const montoCents = Math.round(monto * 100);
    const desc = document.getElementById('input-desc').value.trim();
    const cat = document.getElementById('input-categoria').value;
    
    if (!isNaN(montoCents) && montoCents > 0 && desc) {
        if (gastoEnEdicion) {
            const index = state.historialGlobal.findIndex(g => g.id === gastoEnEdicion);
            if (index !== -1) {
                state.historialGlobal[index].monto = montoCents;
                state.historialGlobal[index].desc = desc;
                state.historialGlobal[index].categoria = cat;
            }
            resetFormularioGasto(setGastoEnEdicion);
        } else {
            state.historialGlobal.push({ id: Date.now(), monto: montoCents, desc: desc, fecha: new Date().toISOString(), categoria: cat });
            document.getElementById('input-monto').value = '';
            document.getElementById('input-desc').value = '';
        }
        guardarYMostrar();
    }
});

document.getElementById('lista-historial').addEventListener('click', (e) => {
    const btnDelete = e.target.closest('.delete-btn');
    const btnEdit = e.target.closest('.edit-btn');
    
    if (btnDelete) {
        const id = parseInt(btnDelete.getAttribute('data-id'), 10);
        state.historialGlobal = state.historialGlobal.filter(g => g.id !== id);
        if (gastoEnEdicion === id) resetFormularioGasto(setGastoEnEdicion); 
        guardarYMostrar();
    } else if (btnEdit) {
        const id = parseInt(btnEdit.getAttribute('data-id'), 10);
        const gasto = state.historialGlobal.find(g => g.id === id);
        if (gasto) {
            document.getElementById('input-monto').value = (gasto.monto / 100).toFixed(2);
            document.getElementById('input-desc').value = gasto.desc;
            document.getElementById('input-categoria').value = gasto.categoria;
            setGastoEnEdicion(id);
            document.getElementById('btn-guardar-gasto').innerText = t('btnEdit');
            document.getElementById('input-monto').focus();
            window.scrollTo({ top: document.getElementById('form-gasto').offsetTop - 20, behavior: 'smooth' });
        }
    }
});

// Event Listeners - Settings & Categories
document.getElementById('btn-toggle-nueva-cat').addEventListener('click', () => {
    document.getElementById('area-nueva-categoria').classList.toggle('oculto');
});

document.getElementById('btn-guardar-nueva-cat').addEventListener('click', () => {
    const nombre = document.getElementById('input-nueva-cat-nombre').value.trim();
    const emoji = document.getElementById('input-nueva-cat-emoji').value.trim();
    if (nombre && emoji) {
        const id = 'custom_' + Date.now();
        state.categoriasCustom.push({ id, nombre, emoji });
        renderizarSelectCategorias(state.categoriasCustom);
        document.getElementById('input-categoria').value = id;
        document.getElementById('input-nueva-cat-nombre').value = '';
        document.getElementById('input-nueva-cat-emoji').value = '';
        document.getElementById('area-nueva-categoria').classList.add('oculto');
    }
});

document.getElementById('btn-editar-presupuesto').addEventListener('click', () => {
    resetFormularioGasto(setGastoEnEdicion); 
    document.getElementById('pantalla-principal').classList.add('oculto');
    document.getElementById('btn-editar-presupuesto').classList.add('oculto');
    document.getElementById('pantalla-configuracion').classList.remove('oculto');
    document.getElementById('area-gastos-previos').classList.add('oculto');
    tabDirecto.click();
    inputPresupuesto.value = (state.presupuestoMensual / 100).toFixed(2);
    inputMoneda.value = state.monedaActual; 
});

// Event Listeners - Data Management
document.getElementById('btn-exportar').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.historialGlobal));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = "floux_backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
});

document.getElementById('btn-importar').addEventListener('click', () => {
    document.getElementById('input-archivo').click();
});

document.getElementById('input-archivo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (isValidoHistorialSchema(data)) {
                resetFormularioGasto(setGastoEnEdicion); 
                if (confirm("Aceptar: Sobrescribir todos los datos.\nCancelar: Combinar con datos actuales.")) {
                    state.historialGlobal = data;
                } else {
                    state.historialGlobal = state.historialGlobal.concat(data);
                }
                guardarYMostrar();
            } else {
                alert("Error: El archivo no tiene el formato correcto.");
            }
        } catch (err) {
            alert("Error: Archivo inválido o corrupto.");
        }
    };
    reader.readAsText(file);
    e.target.value = ''; 
});

document.getElementById('btn-reiniciar').addEventListener('click', () => { 
    if(confirm(t('alertReset'))) { 
        resetFormularioGasto(setGastoEnEdicion); 
        localStorage.clear(); 
        location.reload(); 
    } 
});

// --- LSim Logic ---
const pantallaPrincipal = document.getElementById('pantalla-principal');
const pantallaSimulador = document.getElementById('pantalla-simulador');
const btnAbrirSimulador = document.getElementById('btn-abrir-simulador');
const btnCerrarSimulador = document.getElementById('btn-cerrar-simulador');

btnAbrirSimulador.addEventListener('click', () => {
    pantallaPrincipal.classList.add('oculto');
    pantallaSimulador.classList.remove('oculto');
    calcularPerdidaInvisible(); 
});

btnCerrarSimulador.addEventListener('click', () => {
    pantallaSimulador.classList.add('oculto');
    pantallaPrincipal.classList.remove('oculto');
});

function calcularPerdidaInvisible() {
    const pCents = Math.round((parseFloat(lsimMonto.value) || 0) * 100);
    const tVal = parseFloat(lsimAnos.value) || 0;
    const r = (parseFloat(lsimTasa.value) || 0) / 100;

    const futureValueCents = pCents * Math.pow(1 + r, tVal);

    const localeStr = currentLang === 'es' ? 'es-ES' : (currentLang === 'pt' ? 'pt-BR' : 'en-US');
    lsimResultado.innerText = new Intl.NumberFormat(localeStr, { 
        style: 'currency', 
        currency: state.monedaActual 
    }).format(futureValueCents / 100);
}

document.querySelectorAll('.input-lsim').forEach(input => {
    input.addEventListener('input', calcularPerdidaInvisible);
});

// Boot
init();