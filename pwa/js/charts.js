// Charts & Visualizations Module

let tempChart = null;
let tempChartSmall = null;

// Initialize charts
function initCharts() {
    createTempChart();
    createTempChartSmall();
}

// Create main temperature chart
async function createTempChart() {
    const canvas = document.getElementById('tempChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get temperature data
    const data = await getTempChartData();

    if (tempChart) {
        tempChart.destroy();
    }

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Temperature (°F)',
                data: data.values,
                borderColor: '#B85C4A',
                backgroundColor: 'rgba(184, 92, 74, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#B85C4A',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }, {
                label: 'Normal Range (Upper)',
                data: data.labels.map(() => 99),
                borderColor: '#2E7D6E',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }, {
                label: 'Fever Threshold',
                data: data.labels.map(() => 100.4),
                borderColor: '#C8763E',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function (context) {
                            return data.fullLabels[context[0].dataIndex];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 96,
                    max: 105,
                    title: {
                        display: true,
                        text: 'Temperature (°F)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

// Create small temperature chart for dashboard
async function createTempChartSmall() {
    const canvas = document.getElementById('tempChartSmall');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = await getTempChartData();

    if (tempChartSmall) {
        tempChartSmall.destroy();
    }

    // Only show last 10 readings
    const recentLabels = data.labels.slice(-10);
    const recentValues = data.values.slice(-10);

    tempChartSmall = new Chart(ctx, {
        type: 'line',
        data: {
            labels: recentLabels,
            datasets: [{
                data: recentValues,
                borderColor: '#B85C4A',
                backgroundColor: 'rgba(184, 92, 74, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#B85C4A'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 96,
                    max: 105
                },
                x: {
                    display: true
                }
            }
        }
    });
}

// Get temperature chart data
async function getTempChartData() {
    if (!currentChildId) {
        return { labels: [], values: [], fullLabels: [] };
    }

    const episode = await getActiveEpisode(currentChildId);
    if (!episode) {
        return { labels: [], values: [], fullLabels: [] };
    }

    const vitals = await getRecordsByIndex('vitals', 'episodeId', episode.id);
    const temps = vitals.filter(v => v.type === 'temperature').sort((a, b) => a.timestamp - b.timestamp);

    const labels = [];
    const fullLabels = [];
    const values = [];

    temps.forEach(temp => {
        const date = new Date(temp.timestamp);
        const shortLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const fullLabel = date.toLocaleString();

        labels.push(shortLabel);
        fullLabels.push(fullLabel);

        // Convert to Fahrenheit if needed
        let tempValue = temp.value;
        if (temp.unit === 'C') {
            tempValue = (tempValue * 9 / 5) + 32;
        }
        values.push(tempValue);
    });

    return { labels, values, fullLabels };
}

// Update charts
async function updateCharts() {
    await createTempChart();
    await createTempChartSmall();
}

// Make updateTempChart available globally
window.updateTempChart = updateCharts;

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initCharts, 500);
});
