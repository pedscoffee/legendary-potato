// Timeline Visualization Module

// Render timeline
async function renderTimeline() {
    const container = document.getElementById('timelineView');
    if (!container || !currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        container.innerHTML = '<p class="empty-state">No active episode to display</p>';
        return;
    }

    const episodeData = await getEpisodeData(episode.id);
    const { symptoms, vitals, interventions } = episodeData;

    // Combine all events
    const allEvents = [
        ...symptoms.map(s => ({ ...s, eventType: 'symptom' })),
        ...vitals.map(v => ({ ...v, eventType: 'vital' })),
        ...interventions.map(i => ({ ...i, eventType: 'intervention' }))
    ].sort((a, b) => a.timestamp - b.timestamp);

    if (allEvents.length === 0) {
        container.innerHTML = '<p class="empty-state">No events to display</p>';
        return;
    }

    // Render timeline
    let html = '<div class="timeline">';

    allEvents.forEach((event, index) => {
        const date = new Date(event.timestamp);
        const timeStr = date.toLocaleString();
        const color = getEventColor(event);

        html += `
            <div class="timeline-event" style="border-left: 4px solid ${color};">
                <div class="timeline-time">${timeStr}</div>
                <div class="timeline-content">
                    ${renderTimelineEvent(event)}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Render individual timeline event
function renderTimelineEvent(event) {
    if (event.eventType === 'symptom') {
        const name = formatSymptomName(event.symptomType);
        let html = `<strong>${name}</strong> - ${event.severity}`;
        if (event.notes) html += `<br><span class="text-muted">${event.notes}</span>`;
        if (event.resolved) html += `<br><span class="text-muted">✓ Resolved</span>`;
        return html;
    }

    if (event.eventType === 'vital') {
        if (event.type === 'temperature') {
            return `<strong>Temperature</strong>: ${event.value.toFixed(1)}°${event.unit} (${event.method})`;
        }
        if (event.type === 'breathing') {
            return `<strong>Breathing</strong>: ${event.value}`;
        }
        if (event.type === 'hydration') {
            const data = JSON.parse(event.value);
            return `<strong>Hydration</strong>: ${data.diapers} diapers, ${data.intake} intake`;
        }
        if (event.type === 'food') {
            return `<strong>Food</strong>: ${event.value}${event.notes ? ' - ' + event.notes : ''}`;
        }
        if (event.type === 'sleep') {
            const data = JSON.parse(event.value);
            return `<strong>Sleep</strong>: ${data.duration} hours, ${data.quality}`;
        }
    }

    if (event.eventType === 'intervention') {
        let html = `<strong>${event.name}</strong>`;
        if (event.dose) html += ` (${event.dose})`;
        if (event.effectiveness !== 'pending') {
            html += `<br><span class="text-muted">Effectiveness: ${event.effectiveness}</span>`;
        }
        if (event.notes) html += `<br><span class="text-muted">${event.notes}</span>`;
        return html;
    }

    return 'Event';
}

// Get event color
function getEventColor(event) {
    if (event.eventType === 'symptom') {
        return getSeverityColor(event.severity);
    }
    if (event.eventType === 'vital') {
        return '#2D6A6A'; // Primary color
    }
    if (event.eventType === 'intervention') {
        return '#C8763E'; // Accent color
    }
    return '#6B635A';
}

// Initialize timeline
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderTimeline, 500);
});
