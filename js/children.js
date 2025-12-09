// Child Management Module

let currentChildId = null;
let childrenData = [];

// Heroicons data for child avatars
const availableIcons = [
    { name: 'heart', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />' },
    { name: 'star', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />' },
    { name: 'face-smile', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />' },
    { name: 'sun', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />' },
    { name: 'moon', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />' },
    { name: 'sparkles', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />' },
    { name: 'rocket', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />' },
    { name: 'puzzle-piece', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />' },
    { name: 'cake', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />' },
    { name: 'gift', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />' },
    { name: 'musical-note', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />' },
    { name: 'paint-brush', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />' },
    { name: 'beaker', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />' },
    { name: 'trophy', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />' },
    { name: 'fire', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />' },
    { name: 'cloud', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />' },
    { name: 'bolt', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />' },
    { name: 'cube', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />' },
    { name: 'book', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />' },
    { name: 'football', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />' }
];

// Initialize children module
async function initChildren() {
    childrenData = await getAllRecords('children');

    // Load last active child from localStorage
    const savedChildId = localStorage.getItem('currentChildId');
    if (savedChildId && childrenData.some(c => c.id === savedChildId)) {
        currentChildId = savedChildId;
    } else if (childrenData.length > 0) {
        currentChildId = childrenData[0].id;
    }

    renderChildSelector();
    renderChildrenList();
}

// Render child selector in header
function renderChildSelector() {
    const container = document.getElementById('headerChildSelector');
    if (!container) return;

    if (!currentChildId || childrenData.length === 0) {
        container.innerHTML = '<button class="btn btn-secondary" onclick="showChildModal()">Add Child</button>';
        return;
    }

    const currentChild = childrenData.find(c => c.id === currentChildId);
    if (!currentChild) return;

    const iconData = availableIcons.find(i => i.name === currentChild.iconName);

    container.innerHTML = `
        <select id="childSelect" class="child-select" onchange="switchChild(this.value)">
            ${childrenData.map(child => `
                <option value="${child.id}" ${child.id === currentChildId ? 'selected' : ''}>
                    ${child.name}
                </option>
            `).join('')}
        </select>
    `;
}

// Switch active child
async function switchChild(childId) {
    currentChildId = childId;
    localStorage.setItem('currentChildId', childId);

    // Refresh views
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshSummary) window.refreshSummary();
}

// Show child modal
function showChildModal(childId = null) {
    const modal = document.getElementById('childModal');
    const title = document.getElementById('childModalTitle');
    const nameInput = document.getElementById('childName');

    if (childId) {
        const child = childrenData.find(c => c.id === childId);
        title.textContent = 'Edit Child';
        nameInput.value = child.name;
        renderIconPicker(child.iconName, child.iconColor);
    } else {
        title.textContent = 'Add Child';
        nameInput.value = '';
        renderIconPicker('heart', '#2D6A6A');
    }

    modal.classList.add('active');
    modal.dataset.editId = childId || '';
}

// Render icon picker
function renderIconPicker(selectedIcon = 'heart', selectedColor = '#2D6A6A') {
    const iconGrid = document.getElementById('iconGrid');

    iconGrid.innerHTML = availableIcons.map(icon => `
        <button type="button" class="icon-btn ${icon.name === selectedIcon ? 'selected' : ''}" 
                data-icon="${icon.name}" onclick="selectIcon('${icon.name}')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                ${icon.svg}
            </svg>
        </button>
    `).join('');

    // Set selected color
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        if (btn.dataset.color === selectedColor) {
            btn.classList.add('selected');
        }
        btn.onclick = () => selectColor(btn.dataset.color);
    });
}

// Select icon
function selectIcon(iconName) {
    document.querySelectorAll('.icon-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-icon="${iconName}"]`).classList.add('selected');
}

// Select color
function selectColor(color) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
}

// Save child
async function saveChildProfile() {
    const name = document.getElementById('childName').value.trim();
    const selectedIcon = document.querySelector('.icon-btn.selected');
    const selectedColor = document.querySelector('.color-btn.selected');

    if (!name) {
        alert('Please enter a name');
        return;
    }

    if (!selectedIcon || !selectedColor) {
        alert('Please select an icon and color');
        return;
    }

    const childData = {
        name,
        iconName: selectedIcon.dataset.icon,
        iconColor: selectedColor.dataset.color,
        dateAdded: Date.now()
    };

    const modal = document.getElementById('childModal');
    const editId = modal.dataset.editId;

    if (editId) {
        await updateRecord('children', editId, childData);
    } else {
        const newChild = await addRecord('children', childData);
        currentChildId = newChild.id;
        localStorage.setItem('currentChildId', newChild.id);

        // Create initial episode
        await createEpisode(newChild.id);
    }

    await initChildren();
    closeChildModal();

    if (window.refreshDashboard) window.refreshDashboard();
}

// Close child modal
function closeChildModal() {
    document.getElementById('childModal').classList.remove('active');
}

// Delete child
async function deleteChild(childId) {
    if (!confirm('Are you sure you want to delete this child profile? All associated data will be removed.')) {
        return;
    }

    // Delete child and all associated data
    await deleteRecord('children', childId);

    // Delete all episodes for this child
    const episodes = await getRecordsByIndex('episodes', 'childId', childId);
    for (const episode of episodes) {
        await deleteRecord('episodes', episode.id);
    }

    // Delete all related data
    const [symptoms, vitals, interventions] = await Promise.all([
        getRecordsByIndex('symptoms', 'childId', childId),
        getRecordsByIndex('vitals', 'childId', childId),
        getRecordsByIndex('interventions', 'childId', childId)
    ]);

    for (const item of [...symptoms, ...vitals, ...interventions]) {
        await deleteRecord(item.constructor.name.toLowerCase() + 's', item.id);
    }

    // Switch to another child or clear
    if (currentChildId === childId) {
        childrenData = childrenData.filter(c => c.id !== childId);
        currentChildId = childrenData.length > 0 ? childrenData[0].id : null;
        localStorage.setItem('currentChildId', currentChildId || '');
    }

    await initChildren();
    if (window.refreshDashboard) window.refreshDashboard();
}

// Render children list
function renderChildrenList() {
    const container = document.getElementById('childrenList');
    if (!container) return;

    if (childrenData.length === 0) {
        container.innerHTML = '<p class="empty-state">No children added yet. Click "Add Child" to get started.</p>';
        return;
    }

    container.innerHTML = childrenData.map(child => {
        const iconData = availableIcons.find(i => i.name === child.iconName);
        return `
            <div class="child-card" onclick="switchChild('${child.id}')">
                <div class="child-icon" style="background-color: ${child.iconColor}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        ${iconData.svg}
                    </svg>
                </div>
                <h3>${child.name}</h3>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); showChildModal('${child.id}')" style="flex: 1;">Edit</button>
                    <button class="btn btn-error" onclick="event.stopPropagation(); deleteChild('${child.id}')" style="flex: 1;">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Get current child
function getCurrentChild() {
    return childrenData.find(c => c.id === currentChildId) || null;
}

// Event listeners for child modal
document.addEventListener('DOMContentLoaded', () => {
    const addChildBtn = document.getElementById('addChildBtn');
    const saveChildBtn = document.getElementById('saveChild');
    const cancelChildBtn = document.getElementById('cancelChild');
    const closeModalBtn = document.getElementById('closeChildModal');

    if (addChildBtn) addChildBtn.onclick = () => showChildModal();
    if (saveChildBtn) saveChildBtn.onclick = saveChildProfile;
    if (cancelChildBtn) cancelChildBtn.onclick = closeChildModal;
    if (closeModalBtn) closeModalBtn.onclick = closeChildModal;
});
