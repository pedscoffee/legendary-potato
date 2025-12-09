// Symptom Tracking Module

let selectedSymptom = null;
let selectedSeverity = null;

// Common symptoms list
const commonSymptoms = [
    'fever', 'cough', 'runny-nose', 'congestion', 'vomiting',
    'diarrhea', 'rash', 'ear-pain', 'sore-throat', 'difficulty-breathing',
    'lethargy', 'irritability', 'loss-appetite'
];

// Initialize symptoms module
function initSymptoms() {
    setupSymptomButtons();
    setupSymptomForm();
    setupCustomSymptom();
}

// Setup quick symptom buttons
function setupSymptomButtons() {
    const quickBtns = document.querySelectorAll('.quick-btn[data-symptom]');

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const symptom = btn.dataset.symptom;
            showSymptomForm(symptom);
        });
    });
}

// Show symptom entry form
function showSymptomForm(symptom) {
    selectedSymptom = symptom;
    selectedSeverity = null;

    const form = document.getElementById('symptomForm');
    const title = document.getElementById('symptomFormTitle');
    const timeInput = document.getElementById('symptomTime');
    const notesInput = document.getElementById('symptomNotes');

    // Format symptom name for display
    const displayName = symptom.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    title.textContent = `Log ${displayName}`;

    // Set current time
    const now = new Date();
    timeInput.value = now.toISOString().slice(0, 16);
    notesInput.value = '';

    // Reset severity buttons
    document.querySelectorAll('.severity-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

// Setup symptom form
function setupSymptomForm() {
    // Severity buttons
    const severityBtns = document.querySelectorAll('.severity-btn');
    severityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            severityBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSeverity = btn.dataset.severity;
        });
    });

    // Save button
    const saveBtn = document.getElementById('saveSymptom');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSymptom);
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelSymptom');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('symptomForm').style.display = 'none';
        });
    }
}

// Save symptom
async function saveSymptom() {
    if (!currentChildId) {
        alert('Please select or add a child first');
        return;
    }

    if (!selectedSeverity) {
        alert('Please select severity');
        return;
    }

    const timeInput = document.getElementById('symptomTime');
    const notesInput = document.getElementById('symptomNotes');

    // Get or create active episode
    let episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        episode = await createEpisode(currentChildId);
    }

    const symptomData = {
        episodeId: episode.id,
        childId: currentChildId,
        symptomType: selectedSymptom,
        severity: selectedSeverity,
        timestamp: new Date(timeInput.value).getTime(),
        notes: notesInput.value.trim(),
        resolved: false,
        resolvedTimestamp: null
    };

    await addRecord('symptoms', symptomData);

    // Hide form
    document.getElementById('symptomForm').style.display = 'none';

    // Refresh displays
    displayActiveSymptoms();
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    // Show success feedback
    showNotification('Symptom logged successfully');
}

// Setup custom symptom
function setupCustomSymptom() {
    const addBtn = document.getElementById('addCustomSymptom');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const input = document.getElementById('customSymptomName');
            const customName = input.value.trim();

            if (!customName) {
                alert('Please enter a symptom name');
                return;
            }

            // Convert to slug format
            const slug = customName.toLowerCase().replace(/\s+/g, '-');
            showSymptomForm(slug);
            input.value = '';
        });
    }
}

// Display active symptoms
async function displayActiveSymptoms() {
    const container = document.getElementById('activeSymptomsLog');
    if (!container || !currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        container.innerHTML = '<p class="empty-state">No active episode</p>';
        return;
    }

    const symptoms = await getRecordsByIndex('symptoms', 'episodeId', episode.id);
    const activeSymptoms = symptoms.filter(s => !s.resolved);

    if (activeSymptoms.length === 0) {
        container.innerHTML = '<p class="empty-state">No active symptoms</p>';
        return;
    }

    container.innerHTML = `
        <h3>Active Symptoms</h3>
        <div class="symptoms-list">
            ${activeSymptoms.map(symptom => {
        const displayName = symptom.symptomType.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        const timeStr = new Date(symptom.timestamp).toLocaleString();
        const severityColor = getSeverityColor(symptom.severity);

        return `
                    <div class="symptom-item card" style="border-left: 4px solid ${severityColor};">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h4>${displayName}</h4>
                                <p class="text-muted">Severity: ${symptom.severity}</p>
                                <p class="text-muted">${timeStr}</p>
                                ${symptom.notes ? `<p>${symptom.notes}</p>` : ''}
                            </div>
                            <button class="btn btn-secondary" onclick="resolveSymptom('${symptom.id}')">Resolve</button>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

// Resolve symptom
async function resolveSymptom(symptomId) {
    await updateRecord('symptoms', symptomId, {
        resolved: true,
        resolvedTimestamp: Date.now()
    });

    displayActiveSymptoms();
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Symptom marked as resolved');
}

// Get severity color
function getSeverityColor(severity) {
    const colors = {
        mild: '#2E7D6E',
        moderate: '#D4A574',
        severe: '#B85C4A'
    };
    return colors[severity] || '#6B635A';
}

// Show notification
function showNotification(message) {
    // Simple notification (can be enhanced with a toast library)
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initSymptoms();
});
