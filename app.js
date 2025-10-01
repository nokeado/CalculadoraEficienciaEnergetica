// Datos de la aplicación
const APP_DATA = {
    precios_defecto: {
        electricidad: 0.15,
        gasolina: 1.70,
        diesel: 1.60
    },
    factores_conversion: {
        gasolina: 9.0,
        diesel: 10.0
    },
    coches_defecto: [
        { nombre: "Mi coche gasolina", consumo: 6.0, combustible: "gasolina" },
        { nombre: "Mi coche diésel", consumo: 4.5, combustible: "diesel" }
    ],
    ejemplos_electricos: [
        { modelo: "Tesla Model 3", consumo: 14.4 },
        { modelo: "Tesla Model Y", consumo: 16.8 },
        { modelo: "Fiat 500e", consumo: 13.0 },
        { modelo: "MG4", consumo: 15.8 }
    ]
};

// Estado de la aplicación
let appState = {
    precios: { ...APP_DATA.precios_defecto },
    consumoElectrico: 0,
    cochesCombustion: [...APP_DATA.coches_defecto]
};

// Referencias DOM
const elements = {
    priceElectricity: document.getElementById('price-electricity'),
    priceGasoline: document.getElementById('price-gasoline'),
    priceDiesel: document.getElementById('price-diesel'),
    kwhInput: document.getElementById('kwh-input'),
    gasolineEquivalent: document.getElementById('gasoline-equivalent'),
    dieselEquivalent: document.getElementById('diesel-equivalent'),
    combustionCars: document.getElementById('combustion-cars'),
    addCarBtn: document.getElementById('add-car-btn'),
    resultsSection: document.getElementById('results-section'),
    electricCost: document.getElementById('electric-cost'),
    comparisonsGrid: document.getElementById('comparisons-grid'),
    annualSavings: document.getElementById('annual-savings')
};

/**
 * Formatea números a 2 decimales
 */
function formatNumber(number) {
    return number.toFixed(2);
}

/**
 * Calcula equivalencias energéticas teóricas
 */
function calculateEnergyEquivalents(kwhValue) {
    if (!kwhValue || kwhValue <= 0) return { gasolina: 0, diesel: 0 };
    
    return {
        gasolina: kwhValue / APP_DATA.factores_conversion.gasolina,
        diesel: kwhValue / APP_DATA.factores_conversion.diesel
    };
}

/**
 * Actualiza la visualización de equivalencias energéticas
 */
function updateEnergyEquivalents() {
    const equivalents = calculateEnergyEquivalents(appState.consumoElectrico);
    
    if (elements.gasolineEquivalent) {
        elements.gasolineEquivalent.textContent = formatNumber(equivalents.gasolina);
    }
    if (elements.dieselEquivalent) {
        elements.dieselEquivalent.textContent = formatNumber(equivalents.diesel);
    }
}

/**
 * Calcula coste por 100km para un vehículo
 */
function calculateCost(consumo, tipoCombustible, precios) {
    switch (tipoCombustible) {
        case 'electrico':
            return consumo * precios.electricidad;
        case 'gasolina':
            return consumo * precios.gasolina;
        case 'diesel':
            return consumo * precios.diesel;
        default:
            return 0;
    }
}

/**
 * Actualiza los precios en el estado
 */
function updatePrices() {
    appState.precios = {
        electricidad: parseFloat(elements.priceElectricity.value) || APP_DATA.precios_defecto.electricidad,
        gasolina: parseFloat(elements.priceGasoline.value) || APP_DATA.precios_defecto.gasolina,
        diesel: parseFloat(elements.priceDiesel.value) || APP_DATA.precios_defecto.diesel
    };
    updateResults();
}

/**
 * Actualiza el consumo eléctrico
 */
function updateElectricConsumption() {
    const value = parseFloat(elements.kwhInput.value) || 0;
    appState.consumoElectrico = value;
    updateEnergyEquivalents();
    updateResults();
}

/**
 * Agrega un nuevo coche de combustión
 */
function addCombustionCar() {
    if (appState.cochesCombustion.length >= 4) return;
    
    const newCar = {
        nombre: `Coche ${appState.cochesCombustion.length + 1}`,
        consumo: 6.0,
        combustible: 'gasolina'
    };
    
    appState.cochesCombustion.push(newCar);
    renderCombustionCars();
    updateResults();
}

/**
 * Elimina un coche de combustión
 */
function removeCombustionCar(index) {
    if (appState.cochesCombustion.length > 1) {
        appState.cochesCombustion.splice(index, 1);
        renderCombustionCars();
        updateResults();
    }
}

/**
 * Actualiza un coche de combustión
 */
function updateCombustionCar(index, field, value) {
    if (appState.cochesCombustion[index]) {
        if (field === 'consumo') {
            appState.cochesCombustion[index][field] = parseFloat(value) || 0;
        } else {
            appState.cochesCombustion[index][field] = value;
        }
        updateResults();
    }
}

/**
 * Renderiza los coches de combustión
 */
function renderCombustionCars() {
    if (!elements.combustionCars) return;
    
    elements.combustionCars.innerHTML = '';
    
    appState.cochesCombustion.forEach((car, index) => {
        const carDiv = document.createElement('div');
        carDiv.className = 'car-config';
        
        carDiv.innerHTML = `
            <input type="text" class="car-name" value="${car.nombre}" 
                   onchange="updateCombustionCar(${index}, 'nombre', this.value)">
            <input type="number" class="car-consumption" value="${car.consumo}" step="0.1" min="0"
                   onchange="updateCombustionCar(${index}, 'consumo', this.value)">
            <select class="car-fuel" onchange="updateCombustionCar(${index}, 'combustible', this.value)">
                <option value="gasolina" ${car.combustible === 'gasolina' ? 'selected' : ''}>Gasolina</option>
                <option value="diesel" ${car.combustible === 'diesel' ? 'selected' : ''}>Diésel</option>
            </select>
            <button class="remove-car" onclick="removeCombustionCar(${index})" 
                    ${appState.cochesCombustion.length <= 1 ? 'disabled' : ''}>✕</button>
        `;
        
        elements.combustionCars.appendChild(carDiv);
    });
    
    // Actualizar botón de agregar
    if (elements.addCarBtn) {
        elements.addCarBtn.style.display = appState.cochesCombustion.length >= 4 ? 'none' : 'block';
    }
}

/**
 * Actualiza la sección de resultados
 */
function updateResults() {
    if (!appState.consumoElectrico || appState.consumoElectrico <= 0) {
        if (elements.resultsSection) {
            elements.resultsSection.classList.remove('visible');
        }
        return;
    }
    
    // Mostrar sección de resultados
    if (elements.resultsSection) {
        elements.resultsSection.classList.add('visible');
    }
    
    // Coste eléctrico
    const costElectrico = calculateCost(appState.consumoElectrico, 'electrico', appState.precios);
    if (elements.electricCost) {
        elements.electricCost.textContent = formatNumber(costElectrico);
    }
    
    // Comparaciones
    renderComparisons(costElectrico);
    
    // Ahorros anuales
    renderAnnualSavings(costElectrico);
}

/**
 * Renderiza las comparaciones de coches
 */
function renderComparisons(costElectrico) {
    if (!elements.comparisonsGrid) return;
    
    elements.comparisonsGrid.innerHTML = '';
    
    appState.cochesCombustion.forEach(car => {
        if (car.consumo <= 0) return;
        
        const costCombustion = calculateCost(car.consumo, car.combustible, appState.precios);
        const ahorro = costCombustion - costElectrico;
        const porcentajeAhorro = ((ahorro / costCombustion) * 100);
        
        const comparisonCard = document.createElement('div');
        comparisonCard.className = `comparison-card ${ahorro > 0 ? 'savings' : 'loss'}`;
        
        comparisonCard.innerHTML = `
            <div class="car-info">
                <div class="car-name-display">${car.nombre}</div>
                <div class="car-specs">${car.consumo} l/100km (${car.combustible})</div>
            </div>
            <div class="cost-comparison">
                <span>Coste:</span>
                <span class="comparison-cost">${formatNumber(costCombustion)} €</span>
            </div>
            <div class="savings-amount ${ahorro > 0 ? 'positive' : 'negative'}">
                ${ahorro > 0 ? '+' : ''}${formatNumber(ahorro)} €
            </div>
            <div class="savings-label">
                ${ahorro > 0 ? 'Ahorras' : 'Gastas más'} ${formatNumber(Math.abs(porcentajeAhorro))}%
            </div>
        `;
        
        elements.comparisonsGrid.appendChild(comparisonCard);
    });
}

/**
 * Renderiza los ahorros anuales
 */
function renderAnnualSavings(costElectrico) {
    if (!elements.annualSavings) return;
    
    elements.annualSavings.innerHTML = '';
    
    const kmAnuales = 15000;
    const costElectricoAnual = (costElectrico * kmAnuales) / 100;
    
    appState.cochesCombustion.forEach(car => {
        if (car.consumo <= 0) return;
        
        const costCombustionAnual = (calculateCost(car.consumo, car.combustible, appState.precios) * kmAnuales) / 100;
        const ahorroAnual = costCombustionAnual - costElectricoAnual;
        
        const savingItem = document.createElement('div');
        savingItem.className = 'annual-saving-item';
        
        savingItem.innerHTML = `
            <div class="annual-car-name">${car.nombre}</div>
            <div class="annual-amount ${ahorroAnual > 0 ? 'positive' : 'negative'}">
                ${ahorroAnual > 0 ? '+' : ''}${formatNumber(ahorroAnual)} €/año
            </div>
        `;
        
        elements.annualSavings.appendChild(savingItem);
    });
}

/**
 * Maneja clics en botones de ejemplo
 */
function handleExampleClick(event) {
    const value = parseFloat(event.target.getAttribute('data-value'));
    if (elements.kwhInput && !isNaN(value)) {
        elements.kwhInput.value = value;
        updateElectricConsumption();
        
        // Feedback visual
        event.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            event.target.style.transform = '';
        }, 150);
    }
}

/**
 * Inicializa la aplicación
 */
function initializeApp() {
    console.log('Inicializando aplicación...');
    
    // Event listeners para precios
    if (elements.priceElectricity) {
        elements.priceElectricity.addEventListener('input', updatePrices);
        elements.priceElectricity.addEventListener('change', updatePrices);
    }
    if (elements.priceGasoline) {
        elements.priceGasoline.addEventListener('input', updatePrices);
        elements.priceGasoline.addEventListener('change', updatePrices);
    }
    if (elements.priceDiesel) {
        elements.priceDiesel.addEventListener('input', updatePrices);
        elements.priceDiesel.addEventListener('change', updatePrices);
    }
    
    // Event listener para consumo eléctrico
    if (elements.kwhInput) {
        elements.kwhInput.addEventListener('input', updateElectricConsumption);
        elements.kwhInput.addEventListener('change', updateElectricConsumption);
        elements.kwhInput.focus();
    }
    
    // Event listeners para botones de ejemplo
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', handleExampleClick);
    });
    
    // Event listener para agregar coche
    if (elements.addCarBtn) {
        elements.addCarBtn.addEventListener('click', addCombustionCar);
    }
    
    // Renderizar estado inicial
    renderCombustionCars();
    updateEnergyEquivalents();
    updateResults();
    
    console.log('Aplicación inicializada correctamente');
}

/**
 * Funciones globales para uso en HTML
 */
window.updateCombustionCar = updateCombustionCar;
window.removeCombustionCar = removeCombustionCar;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
