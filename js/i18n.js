export const diccionario = {
    es: {
        appTitle: "Floux - ", currencyLabel: "Moneda", tabDirect: "Ya sé mi presupuesto", tabCalc: "Ayúdame a calcular",
        budgetLabel: "Presupuesto Mensual", budgetPlaceholder: "Ej: 2000", incomeLabel: "Ingresos Totales",
        fixedLabel: "Gastos Fijos", investLabel: "Inversiones", calcResult: "Presupuesto:",
        spentLabel: "¿Ya gastaste algo?", btnStart: "Guardar y Continuar", limitToday: "Tu límite de hoy",
        remainsMonth: "Restante", spentMonth: "Gastado",
        addExpenseTitle: "Registrar Gasto", amountPlaceholder: "Monto", descPlaceholder: "Descripción",
        btnAdd: "Agregar", btnEdit: "Guardar Edición", analysisTitle: "Distribución de Gastos", expensesMonth: "Historial",
        btnExport: "Exportar", btnImport: "Importar", btnReset: "Borrar App", noExpenses: "Sin gastos.",
        prevExpense: "Gasto Previo", alertReset: "🚨 ¿ESTÁS SEGURO?", cat_comida: "Comida",
        cat_transporte: "Transporte", cat_supermercado: "Super", cat_cuentas: "Cuentas",
        cat_ocio: "Ocio", cat_otros: "Otros", newCategory: "Nueva Categoría", catNamePlaceholder: "Nombre (ej: Gimnasio)",
        catEmojiPlaceholder: "Emoji (ej: 🏋️)", btnSave: "Guardar", errorBudget: "Por favor ingresa un presupuesto mayor a 0.",
        lsimTitle: "LSim - Pérdida Invisible", lsimDesc: "Evalúa el costo de oportunidad de compras mayores.", lsimAmount: "Costo de la Compra", lsimYears: "Años proyectados", lsimRate: "Rendimiento Anual (%)", lsimResult: "Pérdida Invisible (Capital Perdido):", btnOpenLSim: "🔮 Simulador LSim", btnClose: "Cerrar"
    },
    en: {
        appTitle: "Floux - ", currencyLabel: "Currency", tabDirect: "I know my budget", tabCalc: "Calculate",
        budgetLabel: "Monthly Budget", budgetPlaceholder: "E.g. 2000", incomeLabel: "Income",
        fixedLabel: "Fixed Expenses", investLabel: "Investments", calcResult: "Budget:",
        spentLabel: "Already spent?", btnStart: "Save and Continue", limitToday: "Today's Limit",
        remainsMonth: "Remaining", spentMonth: "Spent",
        addExpenseTitle: "Log Expense", amountPlaceholder: "Amount", descPlaceholder: "Description",
        btnAdd: "Add", btnEdit: "Save Edit", analysisTitle: "Spending Breakdown", expensesMonth: "History",
        btnExport: "Export", btnImport: "Import", btnReset: "Reset App", noExpenses: "No expenses.",
        prevExpense: "Previous Expense", alertReset: "🚨 ARE YOU SURE?", cat_comida: "Food",
        cat_transporte: "Transport", cat_supermercado: "Groceries", cat_cuentas: "Bills",
        cat_ocio: "Leisure", cat_otros: "Others", newCategory: "New Category", catNamePlaceholder: "Name (e.g., Gym)",
        catEmojiPlaceholder: "Emoji (e.g., 🏋️)", btnSave: "Save", errorBudget: "Please enter a budget greater than 0.",
        lsimTitle: "LSim - Invisible Loss", lsimDesc: "Evaluate the opportunity cost of major purchases.", lsimAmount: "Purchase Cost", lsimYears: "Projected Years", lsimRate: "Annual Return Rate (%)", lsimResult: "Invisible Loss (Opportunity Cost):", btnOpenLSim: "🔮 LSim Simulator", btnClose: "Close"
    },
    pt: {
        appTitle: "Floux - ", currencyLabel: "Moeda", tabDirect: "Já sei meu orçamento", tabCalc: "Calcular",
        budgetLabel: "Orçamento Mensal", budgetPlaceholder: "Ex: 2000", incomeLabel: "Renda Total",
        fixedLabel: "Despesas Fixas", investLabel: "Investimentos", calcResult: "Orçamento:",
        spentLabel: "Já gastou algo?", btnStart: "Salvar e Continuar", limitToday: "Limite de hoje",
        remainsMonth: "Restante", spentMonth: "Gasto",
        addExpenseTitle: "Registrar Despesa", amountPlaceholder: "Valor", descPlaceholder: "Descrição",
        btnAdd: "Adicionar", btnEdit: "Salvar Edição", analysisTitle: "Análise de Gastos", expensesMonth: "Histórico",
        btnExport: "Exportar", btnImport: "Importar", btnReset: "Apagar App", noExpenses: "Sem despesas.",
        prevExpense: "Despesa Anterior", alertReset: "🚨 TEM CERTEZA?", cat_comida: "Comida",
        cat_transporte: "Transporte", cat_supermercado: "Mercado", cat_cuentas: "Contas",
        cat_ocio: "Lazer", cat_otros: "Outros", newCategory: "Nova Categoria", catNamePlaceholder: "Nome (ex: Academia)",
        catEmojiPlaceholder: "Emoji (ex: 🏋️)", btnSave: "Salvar", errorBudget: "Por favor, insira um orçamento maior que 0.",
        lsimTitle: "LSim - Perda Invisível", lsimDesc: "Avalie o custo de oportunidade de grandes compras.", lsimAmount: "Custo da Compra", lsimYears: "Anos Projetados", lsimRate: "Taxa de Retorno Anual (%)", lsimResult: "Perda Invisível (Capital Perdido):", btnOpenLSim: "🔮 Simulador LSim", btnClose: "Fechar"
    }
};

export let currentLang = localStorage.getItem('floux_lang');

if (!currentLang) {
    const userLocale = navigator.language || navigator.userLanguage; 
    currentLang = userLocale.substring(0, 2); 
    if (!diccionario[currentLang]) { currentLang = 'en'; }
}

export function t(key) { 
    return diccionario[currentLang][key] || key; 
}

export function setLangStr(newLang) {
    currentLang = newLang;
    localStorage.setItem('floux_lang', currentLang);
}