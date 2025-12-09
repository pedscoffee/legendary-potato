// Export Module - PDF and Text Export

// Export as PDF
async function exportPDF() {
    const summaryText = await generateSummary();

    // Create PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set font
    doc.setFont('courier');
    doc.setFontSize(10);

    // Title
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    doc.text('PediTrack Medical Summary', 20, 20);

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');

    // Add summary text with word wrap
    const lines = doc.splitTextToSize(summaryText, 170);
    doc.text(lines, 20, 35);

    // Save PDF
    const date = new Date().toISOString().split('T')[0];
    doc.save(`peditrack-summary-${date}.pdf`);

    showNotification('PDF exported successfully!');
}

// Export as text file
async function exportText() {
    const summaryText = await generateSummary();

    // Create blob
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `peditrack-summary-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Text file exported successfully!');
}

// Export episode data as JSON (for backup)
async function exportJSON() {
    if (!currentChildId) {
        alert('No child selected');
        return;
    }

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        alert('No active episode');
        return;
    }

    const episodeData = await getEpisodeData(episode.id);
    const child = getCurrentChild();

    const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0',
        child: {
            name: child.name,
            iconName: child.iconName,
            iconColor: child.iconColor
        },
        episode: {
            startDate: episode.startDate,
            endDate: episode.endDate,
            isActive: episode.isActive
        },
        data: episodeData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `peditrack-data-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!');
}

// Archive current episode
async function archiveCurrentEpisode() {
    if (!currentChildId) {
        alert('No child selected');
        return;
    }

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        alert('No active episode to archive');
        return;
    }

    if (!confirm('Archive the current episode? This will end the current illness tracking.')) {
        return;
    }

    await updateRecord('episodes', episode.id, {
        isActive: false,
        endDate: Date.now()
    });

    // Create a new episode
    await createEpisode(currentChildId);

    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();

    showNotification('Episode archived. New episode started.');
}

// View archived episodes
async function viewArchivedEpisodes() {
    if (!currentChildId) {
        alert('No child selected');
        return;
    }

    const allEpisodes = await getRecordsByIndex('episodes', 'childId', currentChildId);
    const archived = allEpisodes.filter(ep => !ep.isActive);

    if (archived.length === 0) {
        alert('No archived episodes found');
        return;
    }

    let html = '<div class="modal active" id="archiveModal"><div class="modal-content">';
    html += '<div class="modal-header"><h3>Archived Episodes</h3>';
    html += '<button class="modal-close" onclick="closeArchiveModal()">×</button></div>';
    html += '<div class="modal-body">';

    for (const episode of archived) {
        const startDate = new Date(episode.startDate).toLocaleDateString();
        const endDate = episode.endDate ? new Date(episode.endDate).toLocaleDateString() : 'Ongoing';
        const duration = episode.endDate ?
            Math.floor((episode.endDate - episode.startDate) / (1000 * 60 * 60 * 24)) :
            'N/A';

        html += `
            <div class="card">
                <h4>Episode: ${startDate} - ${endDate}</h4>
                <p class="text-muted">Duration: ${duration} days</p>
                <button class="btn btn-secondary" onclick="viewArchivedEpisodeDetails('${episode.id}')">View Details</button>
            </div>
        `;
    }

    html += '</div></div></div>';

    // Remove existing modal if any
    const existing = document.getElementById('archiveModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', html);
}

// Close archive modal
function closeArchiveModal() {
    const modal = document.getElementById('archiveModal');
    if (modal) modal.remove();
}

// View archived episode details
async function viewArchivedEpisodeDetails(episodeId) {
    // This could show a detailed view or export the archived episode
    alert('This feature would show detailed episode information. For now, you can export the data as JSON.');
}

// Clear all data with confirmation
async function clearAllDataConfirm() {
    const confirmation = prompt('Are you absolutely sure you want to delete ALL data? This cannot be undone. Type "DELETE" to confirm:');

    if (confirmation === 'DELETE') {
        await clearAllData();

        // Reset UI
        currentChildId = null;
        localStorage.removeItem('currentChildId');

        // Reload page
        window.location.reload();
    } else {
        alert('Data deletion cancelled');
    }
}

// Initialize export buttons
document.addEventListener('DOMContentLoaded', () => {
    const exportPDFBtn = document.getElementById('exportPDF');
    const exportTextBtn = document.getElementById('exportText');
    const archiveBtn = document.getElementById('archiveEpisode');
    const viewArchiveBtn = document.getElementById('viewArchive');
    const clearDataBtn = document.getElementById('clearAllData');

    if (exportPDFBtn) exportPDFBtn.addEventListener('click', exportPDF);
    if (exportTextBtn) exportTextBtn.addEventListener('click', exportText);
    if (archiveBtn) archiveBtn.addEventListener('click', archiveCurrentEpisode);
    if (viewArchiveBtn) viewArchiveBtn.addEventListener('click', viewArchivedEpisodes);
    if (clearDataBtn) clearDataBtn.addEventListener('click', clearAllDataConfirm);
});
