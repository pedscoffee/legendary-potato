// Interventions & Medications Module

let selectedTreatment = null;
const MEDICATION_WARNING_HOURS = 4; // Hours between doses

// Initialize interventions module
function initInterventions() {
    setupMedicationTracking();
    setupTreatmentTracking();
    displayRecentInterventions();
}

// Setup medication tracking
function setupMedicationTracking() {
    const medType = document.getElementById('medType');
    const customMedGroup = document.getElementById('customMedGroup');
    const saveMedBtn = document.getElementById('saveMed');
    const medTimeInput = document.getElementById('medTime');

    // Set current time
    if (medTimeInput) {
        medTimeInput.value = new Date().toISOString().slice(0, 16);
    }

    // Show/hide custom medication field
    if (medType) {
        medType.addEventListener('change', () => {
            if (medType.value === 'other') {
                customMedGroup.style.display = 'block';
            } else {
                customMedGroup.style.display = 'none';
            }

            // Check for timing warning
            if (medType.value) {
                checkMedicationTiming(medType.value);
            }
        });
    }

    // Save medication button
    if (saveMedBtn) {
        saveMedBtn.addEventListener('click', saveMedication);
    }

    // Real-time timing check on time change
    if (medTimeInput) {
        medTimeInput.addEventListener('change', () => {
            const medType = document.getElementById('medType').value;
            if (medType && medType !== '') {
                checkMedicationTiming(medType);
            }
        });
    }
}

// Check medication timing
async function checkMedicationTiming(medType) {
    if (!currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) return;

    const interventions = await getRecordsByIndex('interventions', 'episodeId', episode.id);
    const medications = interventions.filter(i => i.type === 'medication' && i.name.toLowerCase().includes(medType.toLowerCase()));

    if (medications.length === 0) return;

    // Find most recent dose
    const sortedMeds = medications.sort((a, b) => b.timestamp - a.timestamp);
    const lastDose = sortedMeds[0];
    const medTime = document.getElementById('medTime').value;
    const proposedTime = new Date(medTime).getTime();
    const hoursSinceLast = (proposedTime - lastDose.timestamp) / (1000 * 60 * 60);

    const warningDiv = document.getElementById('medTimingWarning');

    if (hoursSinceLast < MEDICATION_WARNING_HOURS) {
        const hoursRemaining = (MEDICATION_WARNING_HOURS - hoursSinceLast).toFixed(1);
        warningDiv.innerHTML = `
            <svg class="icon-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>Warning: Last dose was ${hoursSinceLast.toFixed(1)} hours ago. Typical waiting period is ${MEDICATION_WARNING_HOURS} hours. Wait ${hoursRemaining} more hours before next dose.</span>
        `;
        warningDiv.style.display = 'flex';
    } else {
        warningDiv.style.display = 'none';
    }
}

// Save medication
async function saveMedication() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    const medTypeSelect = document.getElementById('medType');
    const customMedInput = document.getElementById('customMed');
    const doseInput = document.getElementById('medDose');
    const timeInput = document.getElementById('medTime');

    let medName = medTypeSelect.options[medTypeSelect.selectedIndex].text;

    if (medTypeSelect.value === 'other') {
        medName = customMedInput.value.trim();
        if (!medName) {
            alert('Please enter medication name');
            return;
        }
    } else if (!medTypeSelect.value) {
        alert('Please select a medication type');
        return;
    }

    const dose = doseInput.value.trim();
    if (!dose) {
        alert('Please enter the dose');
        return;
    }

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const interventionData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'medication',
        name: medName,
        dose: dose,
        timestamp: new Date(timeInput.value).getTime(),
        effectiveness: 'pending',
        notes: ''
    };

    await addRecord('interventions', interventionData);

    // Clear form
    medTypeSelect.value = '';
    doseInput.value = '';
    customMedInput.value = '';
    document.getElementById('customMedGroup').style.display = 'none';
    document.getElementById('medTimingWarning').style.display = 'none';
    timeInput.value = new Date().toISOString().slice(0, 16);

    displayRecentInterventions();
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Medication logged successfully');

    // Set reminder to assess effectiveness
    setTimeout(() => {
        if (confirm(`It's been an hour since the last medication. Would you like to log its effectiveness?`)) {
            promptEffectiveness(interventionData.id);
        }
    }, 3600000); // 1 hour
}

// Setup treatment tracking
function setupTreatmentTracking() {
    const treatmentBtns = document.querySelectorAll('.treatment-btn');
    const saveTreatmentBtn = document.getElementById('saveTreatment');
    const cancelTreatmentBtn = document.getElementById('cancelTreatment');

    treatmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const treatment = btn.dataset.treatment;
            showTreatmentForm(treatment);
        });
    });

    if (saveTreatmentBtn) {
        saveTreatmentBtn.addEventListener('click', saveTreatment);
    }

    if (cancelTreatmentBtn) {
        cancelTreatmentBtn.addEventListener('click', () => {
            document.getElementById('treatmentForm').style.display = 'none';
        });
    }
}

// Show treatment form
function showTreatmentForm(treatment) {
    selectedTreatment = treatment;

    const form = document.getElementById('treatmentForm');
    const title = document.getElementById('treatmentFormTitle');
    const timeInput = document.getElementById('treatmentTime');
    const notesInput = document.getElementById('treatmentNotes');

    const displayName = treatment.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    title.textContent = displayName;
    timeInput.value = new Date().toISOString().slice(0, 16);
    notesInput.value = '';

    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

// Save treatment
async function saveTreatment() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    const timeInput = document.getElementById('treatmentTime');
    const notesInput = document.getElementById('treatmentNotes');

    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const displayName = selectedTreatment.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const interventionData = {
        episodeId: episode.id,
        childId: currentChildId,
        type: 'treatment',
        name: displayName,
        dose: '',
        timestamp: new Date(timeInput.value).getTime(),
        effectiveness: 'pending',
        notes: notesInput.value.trim()
    };

    await addRecord('interventions', interventionData);

    // Hide form
    document.getElementById('treatmentForm').style.display = 'none';

    displayRecentInterventions();
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Treatment logged successfully');
}

// Display recent interventions
async function displayRecentInterventions() {
    const container = document.getElementById('recentInterventions');
    if (!container || !currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        container.innerHTML = '<p class="empty-state">No active episode</p>';
        return;
    }

    const interventions = await getRecordsByIndex('interventions', 'episodeId', episode.id);
    const sortedInterventions = interventions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    if (sortedInterventions.length === 0) {
        container.innerHTML = '<p class="empty-state">No interventions logged yet</p>';
        return;
    }

    container.innerHTML = sortedInterventions.map(intervention => {
        const timeStr = new Date(intervention.timestamp).toLocaleString();
        const effectivenessColor = getEffectivenessColor(intervention.effectiveness);

        return `
            <div class="card" style="margin-bottom: 0.5rem; border-left: 4px solid ${effectivenessColor};">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4>${intervention.name}</h4>
                        ${intervention.dose ? `<p class="text-muted">Dose: ${intervention.dose}</p>` : ''}
                        <p class="text-muted">${timeStr}</p>
                        ${intervention.notes ? `<p>${intervention.notes}</p>` : ''}
                        <p class="text-muted">Effectiveness: ${intervention.effectiveness}</p>
                    </div>
                    ${intervention.effectiveness === 'pending' ? `
                        <div style="display: flex; gap: 0.25rem; flex-direction: column;">
                            <button class="btn btn-secondary" onclick="updateEffectiveness('${intervention.id}', 'helped')" style="padding: 0.5rem; font-size: 0.75rem;">Helped</button>
                            <button class="btn btn-secondary" onclick="updateEffectiveness('${intervention.id}', 'no change')" style="padding: 0.5rem; font-size: 0.75rem;">No Change</button>
                            <button class="btn btn-secondary" onclick="updateEffectiveness('${intervention.id}', 'worse')" style="padding: 0.5rem; font-size: 0.75rem;">Worse</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Update effectiveness
async function updateEffectiveness(interventionId, effectiveness) {
    await updateRecord('interventions', interventionId, { effectiveness });

    displayRecentInterventions();
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Effectiveness updated');
}

// Get effectiveness color
function getEffectivenessColor(effectiveness) {
    const colors = {
        helped: '#2E7D6E',
        'no change': '#D4A574',
        worse: '#B85C4A',
        pending: '#6B635A'
    };
    return colors[effectiveness] || '#6B635A';
}

// Prompt for effectiveness assessment
function promptEffectiveness(interventionId) {
    // This could show a modal or form to assess effectiveness
    const effectiveness = prompt('How effective was this intervention?\n1 - Helped\n2 - No Change\n3 - Made Worse');

    const effectivenessMap = {
        '1': 'helped',
        '2': 'no change',
        '3': 'worse'
    };

    if (effectivenessMap[effectiveness]) {
        updateEffectiveness(interventionId, effectivenessMap[effectiveness]);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initInterventions();
});
