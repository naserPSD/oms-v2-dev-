// path: src/utils/offlineDB.js
import Dexie from 'dexie';

class OfflineDB extends Dexie {
    constructor() {
        super('OfficeManagementDB');

        this.version(1).stores({
            // Queue for pending mutations
            mutations: '++id, method, path, timestamp, retryCount, status',
            // Sync status tracking
            syncStatus: 'id, lastSynced, pendingCount'
        });

        this.version(2).upgrade(trans => {
            // Add any new indexes or modifications here
        });
    }
}

export const db = new OfflineDB();

// Initialize database
export const initDB = async () => {
    try {
        await db.open();
        console.log('Offline Database initialized');
        return db;
    } catch (error) {
        console.error('Failed to initialize offline database:', error);
        throw error;
    }
};