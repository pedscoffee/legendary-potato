// Medical Summary Generation Module

// Generate HPI (History of Present Illness)
async function generateSummary() {
    if (!currentChildId) {
        return 'No child selected. Please select or add a child to begin tracking.';
    }

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        return 'No active illness episode. Start logging symptoms to generate a summary.';
    }

    const episodeData = await getEpisodeData(episode.id);
    const { symptoms, vitals, interventions } = episodeData;

    if (symptoms.length === 0 && vitals.length === 0 && interventions.length === 0) {
        return 'No data logged yet. Start tracking symptoms, vitals, and interventions to generate a medical summary.';
    }

    let summary = '';

    // Header
    summary += 'MEDICAL SUMMARY - DE-IDENTIFIED\n';
    summary += '='.repeat(50) + '\n\n';

    // Chief Complaint
    const chiefComplaint = getChiefComplaint(symptoms, vitals);
    summary += `CHIEF COMPLAINT: ${chiefComplaint}\n\n`;

    // HPI Header
    summary += 'HISTORY OF PRESENT ILLNESS:\n';
    const onsetDate = new Date(episode.startDate);
    const daysAgo = Math.floor((Date.now() - episode.startDate) / (1000 * 60 * 60 * 24));
    summary += `The patient is a child presenting with ${chiefComplaint.toLowerCase()} starting ${daysAgo} day(s) ago (${onsetDate.toLocaleDateString()}).\n\n`;

    // Onset
    summary += `ONSET: ${onsetDate.toLocaleString()}\n\n`;

    // Symptom Progression
    if (symptoms.length > 0) {
        summary += 'SYMPTOM PROGRESSION:\n';
        const groupedSymptoms = groupSymptomsByDay(symptoms);

        for (const [day, daySymptoms] of Object.entries(groupedSymptoms)) {
            summary += `\n${day}:\n`;
            daySymptoms.forEach(symptom => {
                const time = new Date(symptom.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const name = formatSymptomName(symptom.symptomType);
                summary += `  - ${time}: ${name} (${symptom.severity})`;
                if (symptom.notes) {
                    summary += ` - ${symptom.notes}`;
                }
                if (symptom.resolved) {
                    const resolvedDate = new Date(symptom.resolvedTimestamp).toLocaleString();
                    summary += ` [Resolved: ${resolvedDate}]`;
                }
                summary += '\n';
            });
        }
        summary += '\n';
    }

    // Vital Signs
    if (vitals.length > 0) {
        summary += 'VITAL SIGNS:\n';

        // Temperature
        const temps = vitals.filter(v => v.type === 'temperature');
        if (temps.length > 0) {
            const maxTemp = Math.max(...temps.map(t => t.value));
            const minTemp = Math.min(...temps.map(t => t.value));
            const latestTemp = temps[temps.length - 1];
            summary += `  Temperature: Range ${minTemp.toFixed(1)}°${latestTemp.unit} - ${maxTemp.toFixed(1)}°${latestTemp.unit}`;
            summary += ` (Current: ${latestTemp.value.toFixed(1)}°${latestTemp.unit} ${latestTemp.method})\n`;

            // List all temperatures
            temps.forEach(temp => {
                const time = new Date(temp.timestamp).toLocaleString();
                summary += `    - ${time}: ${temp.value.toFixed(1)}°${temp.unit} (${temp.method})\n`;
            });
        }

        // Breathing
        const breathing = vitals.filter(v => v.type === 'breathing');
        if (breathing.length > 0) {
            summary += `  Breathing: `;
            breathing.forEach(b => {
                const time = new Date(b.timestamp).toLocaleString();
                summary += `${time} - ${b.value}; `;
            });
            summary += '\n';
        }

        // Hydration
        const hydration = vitals.filter(v => v.type === 'hydration');
        if (hydration.length > 0) {
            summary += `  Hydration:\n`;
            hydration.forEach(h => {
                const time = new Date(h.timestamp).toLocaleString();
                const data = JSON.parse(h.value);
                summary += `    - ${time}: ${data.diapers} wet diapers, intake: ${data.intake}\n`;
            });
        }

        // Food Intake
        const food = vitals.filter(v => v.type === 'food');
        if (food.length > 0) {
            summary += `  Food Intake:\n`;
            food.forEach(f => {
                const time = new Date(f.timestamp).toLocaleString();
                summary += `    - ${time}: ${f.value}`;
                if (f.notes) summary += ` - ${f.notes}`;
                summary += '\n';
            });
        }

        // Sleep
        const sleep = vitals.filter(v => v.type === 'sleep');
        if (sleep.length > 0) {
            summary += `  Sleep:\n`;
            sleep.forEach(s => {
                const time = new Date(s.timestamp).toLocaleString();
                const data = JSON.parse(s.value);
                summary += `    - ${time}: ${data.duration} hours, quality: ${data.quality}\n`;
            });
        }

        summary += '\n';
    }

    // Interventions & Response
    if (interventions.length > 0) {
        summary += 'INTERVENTIONS & RESPONSE:\n';

        const medications = interventions.filter(i => i.type === 'medication');
        const treatments = interventions.filter(i => i.type === 'treatment');

        if (medications.length > 0) {
            summary += '\n  Medications:\n';
            medications.forEach(med => {
                const time = new Date(med.timestamp).toLocaleString();
                summary += `    - ${time}: ${med.name}`;
                if (med.dose) summary += ` (${med.dose})`;
                if (med.effectiveness !== 'pending') {
                    summary += ` - Effectiveness: ${med.effectiveness}`;
                }
                if (med.notes) summary += ` - ${med.notes}`;
                summary += '\n';
            });
        }

        if (treatments.length > 0) {
            summary += '\n  Treatments:\n';
            treatments.forEach(treatment => {
                const time = new Date(treatment.timestamp).toLocaleString();
                summary += `    - ${time}: ${treatment.name}`;
                if (treatment.effectiveness !== 'pending') {
                    summary += ` - Effectiveness: ${treatment.effectiveness}`;
                }
                if (treatment.notes) summary += ` - ${treatment.notes}`;
                summary += '\n';
            });
        }

        summary += '\n';
    }

    // Current Status
    summary += 'CURRENT STATUS:\n';
    const activeSymptoms = symptoms.filter(s => !s.resolved);
    if (activeSymptoms.length > 0) {
        summary += '  Active Symptoms:\n';
        activeSymptoms.forEach(symptom => {
            const name = formatSymptomName(symptom.symptomType);
            const duration = Math.floor((Date.now() - symptom.timestamp) / (1000 * 60 * 60));
            summary += `    - ${name} (${symptom.severity}) for ${duration} hours\n`;
        });
    } else {
        summary += '  No active symptoms (all resolved)\n';
    }

    // Most recent vital if available
    if (vitals.length > 0) {
        const latestVital = vitals[vitals.length - 1];
        const time = new Date(latestVital.timestamp).toLocaleString();
        summary += `  Most Recent Vital: ${latestVital.type} at ${time}\n`;
    }

    summary += '\n' + '='.repeat(50) + '\n';
    summary += 'End of Summary\n';
    summary += `Generated: ${new Date().toLocaleString()}\n`;

    return summary;
}

// Get chief complaint from symptoms
function getChiefComplaint(symptoms, vitals) {
    if (symptoms.length === 0 && vitals.length === 0) {
        return 'General illness';
    }

    // Get first symptom or find fever
    const feverVitals = vitals.filter(v => v.type === 'temperature' && v.value > 100.4);
    const hasFever = feverVitals.length > 0;

    if (hasFever) {
        if (symptoms.length > 0) {
            const firstSymptom = formatSymptomName(symptoms[0].symptomType);
            return `Fever and ${firstSymptom.toLowerCase()}`;
        }
        return 'Fever';
    }

    if (symptoms.length > 0) {
        const primarySymptoms = symptoms.slice(0, 2).map(s => formatSymptomName(s.symptomType).toLowerCase());
        return primarySymptoms.join(' and ');
    }

    return 'Illness';
}

// Group symptoms by day
function groupSymptomsByDay(symptoms) {
    const grouped = {};

    symptoms.forEach(symptom => {
        const date = new Date(symptom.timestamp);
        const dayKey = date.toLocaleDateString();

        if (!grouped[dayKey]) {
            grouped[dayKey] = [];
        }
        grouped[dayKey].push(symptom);
    });

    return grouped;
}

// Format symptom name
function formatSymptomName(symptomType) {
    return symptomType.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Render summary
async function renderSummary() {
    const container = document.getElementById('summaryContent');
    if (!container) return;

    const summaryText = await generateSummary();
    container.textContent = summaryText;
}

// Copy summary to clipboard
async function copySummaryToClipboard() {
    const summaryText = await generateSummary();

    try {
        await navigator.clipboard.writeText(summaryText);
        showNotification('Summary copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = summaryText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Summary copied to clipboard!');
    }
}

// Refresh summary (called from other modules)
window.refreshSummary = renderSummary;

// Initialize summary
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copySummary');
    if (copyBtn) {
        copyBtn.addEventListener('click', copySummaryToClipboard);
    }

    // Render initial summary
    setTimeout(renderSummary, 500);
});
