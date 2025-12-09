// Main Application Entry Point

// App state
window.currentChildId = null;

// Initialize the app
async function initApp() {
    try {
        // Initialize database
        await initDB();

        // Initialize children
        await initChildren();

        // Setup navigation
        setupNavigation();

        // Setup tabs
        setupTabs();

        // Refresh dashboard
        refreshDashboard();

        // Show install prompt if available
        setupInstallPrompt();

        console.log('PediTrack initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error initializing app. Please refresh the page.');
    }
}

// Setup navigation
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;

            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active section
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Refresh content based on section
            if (sectionId === 'dashboard') {
                refreshDashboard();
            } else if (sectionId === 'summary') {
                renderSummary();
                renderTimeline();
                updateCharts();
            } else if (sectionId === 'log') {
                displayActiveSymptoms();
                displayRecentInterventions();
            }
        });
    });
}

// Setup tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab + '-tab';

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// Refresh dashboard
async function refreshDashboard() {
    if (!currentChildId) {
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.innerHTML = `
                <h2>Welcome to PediTrack</h2>
                <p>Add a child to get started tracking symptoms and managing illness episodes.</p>
            `;
        }

        // Clear other dashboard sections
        const sections = ['currentEpisode', 'recentEntries', 'activeSymptoms'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p class="empty-state">No child selected</p>';
        });

        return;
    }

    const child = getCurrentChild();
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg && child) {
        welcomeMsg.innerHTML = `
            <h2>Tracking: ${child.name}</h2>
            <p>Manage symptoms, vitals, and interventions during illness episodes.</p>
        `;
    }

    // Display current episode
    await displayCurrentEpisode();

    // Display recent entries
    await displayRecentEntries();

    // Display active symptoms
    await displayDashboardActiveSymptoms();

    // Update small temp chart
    if (window.updateTempChart) {
        await updateCharts();
    }
}

// Display current episode info
async function displayCurrentEpisode() {
    const container = document.getElementById('currentEpisode');
    if (!container || !currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);

    if (!episode) {
        container.innerHTML = '<p class="empty-state">No active episode</p>';
        return;
    }

    const startDate = new Date(episode.startDate);
    const daysActive = Math.floor((Date.now() - episode.startDate) / (1000 * 60 * 60 * 24));

    container.innerHTML = `
        <p><strong>Started:</strong> ${startDate.toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${daysActive} day(s)</p>
        <p class="text-muted">Episode ID: ${episode.id.slice(0, 8)}</p>
    `;
}

// Display recent entries on dashboard
async function displayRecentEntries() {
    const container = document.getElementById('recentEntries');
    if (!container || !currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        container.innerHTML = '<p class="empty-state">No active episode</p>';
        return;
    }

    const episodeData = await getEpisodeData(episode.id);
    const { symptoms, vitals, interventions } = episodeData;

    // Combine and sort by timestamp
    const allEntries = [
        ...symptoms.map(s => ({ ...s, type: 'symptom' })),
        ...vitals.map(v => ({ ...v, type: 'vital' })),
        ...interventions.map(i => ({ ...i, type: 'intervention' }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    if (allEntries.length === 0) {
        container.innerHTML = '<p class="empty-state">No entries yet</p>';
        return;
    }

    container.innerHTML = allEntries.map(entry => {
        const time = new Date(entry.timestamp).toLocaleString();
        let description = '';

        if (entry.type === 'symptom') {
            const name = formatSymptomName(entry.symptomType);
            description = `${name} (${entry.severity})`;
        } else if (entry.type === 'vital') {
            if (entry.type === 'temperature') {
                description = `Temp: ${entry.value}°${entry.unit}`;
            } else {
                description = `${entry.type}: ${entry.value}`;
            }
        } else if (entry.type === 'intervention') {
            description = entry.name;
        }

        return `
            <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--surface);">
                <p style="margin: 0;"><strong>${description}</strong></p>
                <p class="text-muted" style="margin: 0; font-size: 0.875rem;">${time}</p>
            </div>
        `;
    }).join('');
}

// Display active symptoms on dashboard
async function displayDashboardActiveSymptoms() {
    const container = document.getElementById('activeSymptoms');
    if (!container || !currentChildId) return;

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        container.innerHTML = '<p class="empty-state">No active episode</p>';
        return;
    }

    const symptoms = await getRecordsByIndex('symptoms', 'episodeId', episode.id);
    const active = symptoms.filter(s => !s.resolved);

    if (active.length === 0) {
        container.innerHTML = '<p class="empty-state">No active symptoms ✓</p>';
        return;
    }

    container.innerHTML = active.map(symptom => {
        const name = formatSymptomName(symptom.symptomType);
        const duration = Math.floor((Date.now() - symptom.timestamp) / (1000 * 60 * 60));
        const color = getSeverityColor(symptom.severity);

        return `
            <div style="padding: 0.5rem; margin-bottom: 0.5rem; border-left: 4px solid ${color}; background: var(--surface); border-radius: 4px;">
                <p style="margin: 0;"><strong>${name}</strong></p>
                <p class="text-muted" style="margin: 0; font-size: 0.875rem;">${symptom.severity} - ${duration}h ago</p>
            </div>
        `;
    }).join('');
}

// Make refreshDashboard available globally
window.refreshDashboard = refreshDashboard;

// Setup PWA install prompt
let deferredPrompt;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install button/banner
        showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        deferredPrompt = null;
    });
}

function showInstallBanner() {
    // Create install banner
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--primary); color: white;">
            <div>
                <strong>Install PediTrack</strong>
                <p style="margin: 0; font-size: 0.875rem;">Install the app for quick access</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" onclick="dismissInstallBanner()">Later</button>
                <button class="btn" onclick="installPWA()" style="background: white; color: var(--primary);">Install</button>
            </div>
        </div>
    `;

    // Only show if not already dismissed
    if (!localStorage.getItem('installBannerDismissed')) {
        document.body.insertAdjacentElement('afterbegin', banner);
    }
}

async function installPWA() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User ${outcome} the install prompt`);
    deferredPrompt = null;

    const banner = document.querySelector('.install-banner');
    if (banner) banner.remove();
}

function dismissInstallBanner() {
    localStorage.setItem('installBannerDismissed', 'true');
    const banner = document.querySelector('.install-banner');
    if (banner) banner.remove();
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .timeline {
        position: relative;
        padding-left: 0;
    }
    
    .timeline-event {
        padding: 1rem;
        padding-left: 1.5rem;
        margin-bottom: 1rem;
        background: white;
        border-radius: var(--radius-md);
        position: relative;
    }
    
    .timeline-time {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
    }
    
    .timeline-content {
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
