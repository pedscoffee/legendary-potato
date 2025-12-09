// IndexedDB Management
const DB_NAME = 'PediTrackDB';
const DB_VERSION = 1;

let db = null;

// Initialize the database
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Children store
            if (!db.objectStoreNames.contains('children')) {
                const childrenStore = db.createObjectStore('children', { keyPath: 'id' });
                childrenStore.createIndex('dateAdded', 'dateAdded', { unique: false });
            }

            // Episodes store
            if (!db.objectStoreNames.contains('episodes')) {
                const episodesStore = db.createObjectStore('episodes', { keyPath: 'id' });
                episodesStore.createIndex('childId', 'childId', { unique: false });
                episodesStore.createIndex('isActive', 'isActive', { unique: false });
            }

            // Symptoms store
            if (!db.objectStoreNames.contains('symptoms')) {
                const symptomsStore = db.createObjectStore('symptoms', { keyPath: 'id' });
                symptomsStore.createIndex('episodeId', 'episodeId', { unique: false });
                symptomsStore.createIndex('childId', 'childId', { unique: false });
                symptomsStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // Vitals store
            if (!db.objectStoreNames.contains('vitals')) {
                const vitalsStore = db.createObjectStore('vitals', { keyPath: 'id' });
                vitalsStore.createIndex('episodeId', 'episodeId', { unique: false });
                vitalsStore.createIndex('childId', 'childId', { unique: false });
                vitalsStore.createIndex('timestamp', 'timestamp', { unique: false });
                vitalsStore.createIndex('type', 'type', { unique: false });
            }

            // Interventions store
            if (!db.objectStoreNames.contains('interventions')) {
                const interventionsStore = db.createObjectStore('interventions', { keyPath: 'id' });
                interventionsStore.createIndex('episodeId', 'episodeId', { unique: false });
                interventionsStore.createIndex('childId', 'childId', { unique: false });
                interventionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                interventionsStore.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Add record to store
async function addRecord(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        data.id = data.id || generateUUID();
        const request = store.add(data);

        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
    });
}

// Update record in store
async function updateRecord(storeName, id, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const existingData = getRequest.result;
            if (!existingData) {
                reject(new Error('Record not found'));
                return;
            }

            const updatedData = { ...existingData, ...data, id };
            const putRequest = store.put(updatedData);

            putRequest.onsuccess = () => resolve(updatedData);
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
}

// Get record by ID
async function getRecord(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get all records from store
async function getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Get records by index
async function getRecordsByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Delete record
async function deleteRecord(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// Clear all data from a store
async function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// Clear all data from all stores
async function clearAllData() {
    const stores = ['children', 'episodes', 'symptoms', 'vitals', 'interventions'];

    for (const store of stores) {
        await clearStore(store);
    }

    return true;
}

// Get records for a specific episode
async function getEpisodeData(episodeId) {
    const [symptoms, vitals, interventions] = await Promise.all([
        getRecordsByIndex('symptoms', 'episodeId', episodeId),
        getRecordsByIndex('vitals', 'episodeId', episodeId),
        getRecordsByIndex('interventions', 'episodeId', episodeId)
    ]);

    return {
        symptoms: symptoms.sort((a, b) => a.timestamp - b.timestamp),
        vitals: vitals.sort((a, b) => a.timestamp - b.timestamp),
        interventions: interventions.sort((a, b) => a.timestamp - b.timestamp)
    };
}

// Get active episode for a child
async function getActiveEpisode(childId) {
    const episodes = await getRecordsByIndex('episodes', 'childId', childId);
    return episodes.find(ep => ep.isActive) || null;
}

// Create new episode
async function createEpisode(childId, chiefComplaint = '') {
    // Deactivate any existing active episodes for this child
    const activeEpisode = await getActiveEpisode(childId);
    if (activeEpisode) {
        await updateRecord('episodes', activeEpisode.id, { isActive: false, endDate: Date.now() });
    }

    // Create new active episode
    const episode = {
        childId,
        startDate: Date.now(),
        endDate: null,
        isActive: true,
        chiefComplaint
    };

    return await addRecord('episodes', episode);
}
