import { state, loadStore, saveStore, isValidoHistorialSchema } from './store.js';
import { currentLang, t, setLangStr } from './i18n.js';
import { aplicarTraduccion, renderizarSelectCategorias, actualizarInterfaz, resetFormularioGasto } from './ui.js';

let gastoEnEdicion = null;
const setGastoEnEdicion = (val) => { gastoEnEdicion = val; };

const hoy = new Date();
const mesActual = hoy.getMonth();
const añoActual = hoy.getFullYear();

let modoActual = 'directo';
let presupuestoCalculadoTemporal = 0;

// Application Initialization
function init() {
    const hasData = loadStore();
    document.getElementById('input-moneda').value = state.monedaActual;
    
    // Set initial active flag
    const activeFlag = document.querySelector(`.flag[data-lang="${currentLang}"]`);
    if (activeFlag) activeFlag.classList.add('active');

    aplicarTraduccion(gastoEnEdicion);
    renderizarSelectCategorias(state.categoriasCustom);

    if (hasData) {
        if (localStorage.getItem('floux_mes_guardado') === null || parseInt(localStorage.getItem('floux_mes_guardado')) !== mesActual) {
            localStorage.setItem('floux_mes_guardado', mesActual);
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
        const i = parseFloat(document.getElementById('input-ingresos').value);
        const f = parseFloat(document.getElementById('input-fijos').value);
        const v = parseFloat(document.getElementById('input-inversiones').value);
        
        const ing = isNaN(i) ? 0 : i;
        const fij = isNaN(f) ? 0 : f;
        const inv = isNaN(v) ? 0 : v;

        presupuestoCalculadoTemporal = Math.max(0, ing - fij - inv);
        const localeStr = currentLang === 'es' ? 'es-ES' : (currentLang === 'pt' ? 'pt-BR' : 'en-US');
        document.getElementById('display-calculado').innerText = new Intl.NumberFormat(localeStr, { style: 'currency', currency: document.getElementById('input-moneda').value }).format(presupuestoCalculadoTemporal);
    });
});

document.getElementById('btn-comenzar').addEventListener('click', () => {
    state.presupuestoMensual = modoActual === 'directo' ? parseFloat(document.getElementById('input-presupuesto').value) : presupuestoCalculadoTemporal;
    state.monedaActual = document.getElementById('input-moneda').value; 
    
    if (isNaN(state.presupuestoMensual) || state.presupuestoMensual <= 0) {
        alert(t('errorBudget'));
        return;
    }

    if (!document.getElementById('area-gastos-previos').classList.contains('oculto')) {
        const inputInicial = parseFloat(document.getElementById('input-gastos-iniciales').value);
        const inicial = isNaN(inputInicial) ? 0 : inputInicial;
        if (inicial > 0) state.historialGlobal.push({ id: Date.now(), monto: inicial, desc: t('prevExpense'), fecha: new Date().toISOString(), categoria: 'otros_previo' });
    }

    localStorage.setItem('floux_mes_guardado', mesActual); 
    guardarYMostrar();
});

// Event Listeners - CRUD Operations
document.getElementById('form-gasto').addEventListener('submit', (e) => {
    e.preventDefault(); 
    const monto = parseFloat(document.getElementById('input-monto').value);
    const desc = document.getElementById('input-desc').value.trim();
    const cat = document.getElementById('input-categoria').value;
    
    if (!isNaN(monto) && monto > 0 && desc) {
        if (gastoEnEdicion) {
            const index = state.historialGlobal.findIndex(g => g.id === gastoEnEdicion);
            if (index !== -1) {
                state.historialGlobal[index].monto = monto;
                state.historialGlobal[index].desc = desc;
                state.historialGlobal[index].categoria = cat;
            }
            resetFormularioGasto(setGastoEnEdicion);
        } else {
            state.historialGlobal.push({ id: Date.now(), monto: monto, desc: desc, fecha: new Date().toISOString(), categoria: cat });
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
            document.getElementById('input-monto').value = gasto.monto;
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
    document.getElementById('input-presupuesto').value = state.presupuestoMensual;
    document.getElementById('input-moneda').value = state.monedaActual; 
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

const lsimMonto = document.getElementById('input-lsim-monto');
const lsimAnos = document.getElementById('input-lsim-anos');
const lsimTasa = document.getElementById('input-lsim-tasa');
const lsimResultado = document.getElementById('display-lsim-resultado');

btnAbrirSimulador.addEventListener('click', () => {
    pantallaPrincipal.classList.add('oculto');
    pantallaSimulador.classList.remove('oculto');
    calcularPerdidaInvisible(); // Initialize with zeros/defaults
});

btnCerrarSimulador.addEventListener('click', () => {
    pantallaSimulador.classList.add('oculto');
    pantallaPrincipal.classList.remove('oculto');
});

function calcularPerdidaInvisible() {
    const p = parseFloat(lsimMonto.value) || 0;
    const t = parseFloat(lsimAnos.value) || 0;
    const r = (parseFloat(lsimTasa.value) || 0) / 100;

    const futureValue = p * Math.pow(1 + r, t);

    const localeStr = currentLang === 'es' ? 'es-ES' : (currentLang === 'pt' ? 'pt-BR' : 'en-US');
    lsimResultado.innerText = new Intl.NumberFormat(localeStr, { 
        style: 'currency', 
        currency: state.monedaActual 
    }).format(futureValue);
}

document.querySelectorAll('.input-lsim').forEach(input => {
    input.addEventListener('input', calcularPerdidaInvisible);
});
// Boot
init();