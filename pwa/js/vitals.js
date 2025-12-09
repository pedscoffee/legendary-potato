// Vitals Tracking Module

let tempUnit = 'F'; // F or C
let selectedBreathing = null;
let selectedIntake = null;
let selectedFood = null;
let selectedSleep = null;
let diaperCount = 0;

// Initialize vitals module
function initVitals() {
    setupTemperatureTracking();
    setupBreathingTracking();
    setupHydrationTracking();
    setupFoodTracking();
    setupSleepTracking();
}

// Setup temperature tracking
function setupTemperatureTracking() {
    const quickTempBtns = document.querySelectorAll('.quick-temp-btn');
    const tempValue = document.getElementById('tempValue');
    const tempUnitBtn = document.getElementById('tempUnit');
    const saveTempBtn = document.getElementById('saveTemp');
    const tempTimeInput = document.getElementById('tempTime');

    // Set current time
    if (tempTimeInput) {
        tempTimeInput.value = new Date().toISOString().slice(0, 16);
    }

    // Quick temp buttons
    quickTempBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const temp = btn.dataset.temp;
            tempValue.value = temp;
        });
    });

    // Unit toggle
    if (tempUnitBtn) {
        tempUnitBtn.addEventListener('click', () => {
            if (tempUnit === 'F') {
                tempUnit = 'C';
                tempUnitBtn.textContent = '°C';
                // Convert current value if present
                if (tempValue.value) {
                    tempValue.value = ((parseFloat(tempValue.value) - 32) * 5 / 9).toFixed(1);
                }
            } else {
                tempUnit = 'F';
                tempUnitBtn.textContent = '°F';
                // Convert current value if present
                if (tempValue.value) {
                    tempValue.value = ((parseFloat(tempValue.value) * 9 / 5) + 32).toFixed(1);
                }
            }
        });
    }

    // Save temp button
    if (saveTempBtn) {
        saveTempBtn.addEventListener('click', saveTemperature);
    }
}

// Save temperature
async function saveTemperature() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    const tempValue = document.getElementById('tempValue').value;
    const tempMethod = document.getElementById('tempMethod').value;
    const tempTime = document.getElementById('tempTime').value;

    if (!tempValue) {
        alert('Please enter a temperature value');
        return;
    }

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const vitalData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'temperature',
        timestamp: new Date(tempTime).getTime(),
        value: parseFloat(tempValue),
        unit: tempUnit,
        method: tempMethod,
        notes: ''
    };

    await addRecord('vitals', vitalData);

    // Clear form
    document.getElementById('tempValue').value = '';
    document.getElementById('tempTime').value = new Date().toISOString().slice(0, 16);

    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();
    if (window.updateTempChart) window.updateTempChart();

    showNotification('Temperature logged successfully');
}

// Setup breathing tracking
function setupBreathingTracking() {
    const breathingBtns = document.querySelectorAll('.breathing-btn');
    const saveBtn = document.getElementById('saveBreathing');

    breathingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            breathingBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedBreathing = btn.dataset.level;
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', saveBreathing);
    }
}

// Save breathing assessment
async function saveBreathing() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    if (!selectedBreathing) {
        alert('Please select breathing difficulty level');
        return;
    }

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const vitalData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'breathing',
        timestamp: Date.now(),
        value: selectedBreathing,
        unit: '',
        method: '',
        notes: ''
    };

    await addRecord('vitals', vitalData);

    // Reset selection
    document.querySelectorAll('.breathing-btn').forEach(b => b.classList.remove('selected'));
    selectedBreathing = null;

    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Breathing assessment logged');
}

// Setup hydration tracking
function setupHydrationTracking() {
    const minusBtn = document.getElementById('diaperMinus');
    const plusBtn = document.getElementById('diaperPlus');
    const countDisplay = document.getElementById('diaperCount');
    const intakeBtns = document.querySelectorAll('.intake-btn');
    const saveBtn = document.getElementById('saveHydration');

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            if (diaperCount > 0) {
                diaperCount--;
                countDisplay.textContent = diaperCount;
            }
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            diaperCount++;
            countDisplay.textContent = diaperCount;
        });
    }

    intakeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            intakeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedIntake = btn.dataset.intake;
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', saveHydration);
    }
}

// Save hydration
async function saveHydration() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    if (!selectedIntake && diaperCount === 0) {
        alert('Please log at least one hydration metric');
        return;
    }

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const vitalData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'hydration',
        timestamp: Date.now(),
        value: JSON.stringify({
            diapers: diaperCount,
            intake: selectedIntake || 'not_specified'
        }),
        unit: '',
        method: '',
        notes: ''
    };

    await addRecord('vitals', vitalData);

    // Reset
    diaperCount = 0;
    document.getElementById('diaperCount').textContent = '0';
    document.querySelectorAll('.intake-btn').forEach(b => b.classList.remove('selected'));
    selectedIntake = null;

    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Hydration logged');
}

// Setup food tracking
function setupFoodTracking() {
    const foodBtns = document.querySelectorAll('.food-btn');
    const saveBtn = document.getElementById('saveFood');

    foodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            foodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedFood = btn.dataset.food;
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', saveFood);
    }
}

// Save food intake
async function saveFood() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    if (!selectedFood) {
        alert('Please select food intake level');
        return;
    }

    const notes = document.getElementById('foodNotes').value.trim();

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const vitalData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'food',
        timestamp: Date.now(),
        value: selectedFood,
        unit: '',
        method: '',
        notes
    };

    await addRecord('vitals', vitalData);

    // Reset
    document.querySelectorAll('.food-btn').forEach(b => b.classList.remove('selected'));
    selectedFood = null;
    document.getElementById('foodNotes').value = '';

    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Food intake logged');
}

// Setup sleep tracking
function setupSleepTracking() {
    const sleepBtns = document.querySelectorAll('.sleep-btn');
    const saveBtn = document.getElementById('saveSleep');

    sleepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sleepBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSleep = btn.dataset.quality;
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', saveSleep);
    }
}

// Save sleep
async function saveSleep() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    const duration = document.getElementById('sleepDuration').value;

    if (!duration && !selectedSleep) {
        alert('Please enter sleep duration or quality');
        return;
    }

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const vitalData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'sleep',
        timestamp: Date.now(),
        value: JSON.stringify({
            duration: duration || 0,
            quality: selectedSleep || 'not_specified'
        }),
        unit: 'hours',
        method: '',
        notes: ''
    };

    await addRecord('vitals', vitalData);

    // Reset
    document.getElementById('sleepDuration').value = '';
    document.querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('selected'));
    selectedSleep = null;

    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Sleep logged');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initVitals();
});
