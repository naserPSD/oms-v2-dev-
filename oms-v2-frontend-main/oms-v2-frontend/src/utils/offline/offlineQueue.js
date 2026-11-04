// path: src/utils/offlineQueue.js
import { db } from './offlineDB';

export const QueueStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Add mutation to queue
export const addToQueue = async (mutation) => {
    try {
        const id = await db.mutations.add({
            ...mutation,
            timestamp: Date.now(),
            retryCount: 0,
            status: QueueStatus.PENDING,
            createdAt: new Date().toISOString()
        });

        console.log('Added to offline queue:', { id, mutation });
        return id;
    } catch (error) {
        console.error('Error adding to queue:', error);
        throw error;
    }
};

// Get all pending mutations
export const getQueue = async () => {
    try {
        return await db.mutations
            .where('status')
            .anyOf([QueueStatus.PENDING, QueueStatus.FAILED])
            .sortBy('timestamp');
    } catch (error) {
        console.error('Error getting queue:', error);
        return [];
    }
};

// Update mutation status
export const updateQueueItem = async (id, updates) => {
    try {
        await db.mutations.update(id, updates);
    } catch (error) {
        console.error('Error updating queue item:', error);
        throw error;
    }
};

// Remove completed mutation
export const removeFromQueue = async (id) => {
    try {
        await db.mutations.delete(id);
    } catch (error) {
        console.error('Error removing from queue:', error);
        throw error;
    }
};

// Clear old completed items (cleanup)
export const cleanupQueue = async () => {
    try {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        await db.mutations
            .where('timestamp')
            .below(oneWeekAgo)
            .delete();
    } catch (error) {
        console.error('Error cleaning up queue:', error);
    }
};

// Get mutation by ID for debugging
export const getMutationById = async (id) => {
    try {
        return await db.mutations.get(id);
    } catch (error) {
        console.error('Error getting mutation by ID:', error);
        return null;
    }
};

// Get all mutations (for debugging)
export const getAllMutations = async () => {
    try {
        return await db.mutations.toArray();
    } catch (error) {
        console.error('Error getting all mutations:', error);
        return [];
    }
};

// Remove invalid mutations (e.g., with [object Object] in path that can't be fixed)
export const removeInvalidMutations = async () => {
    try {
        const allMutations = await db.mutations.toArray();
        const invalidMutations = allMutations.filter(m => {
            // Check for invalid paths
            if (m.path && m.path.includes('[object Object]')) {
                // Try to see if we can fix it
                if (m.path.includes('/activities/')) {
                    // If it's an activities endpoint and we can't extract ID, it's invalid
                    return true;
                }
            }
            return false;
        });
        
        if (invalidMutations.length > 0) {
            console.log(`🧹 Removing ${invalidMutations.length} invalid mutations from queue`);
            for (const mutation of invalidMutations) {
                await db.mutations.delete(mutation.id || mutation);
            }
            return invalidMutations.length;
        }
        return 0;
    } catch (error) {
        console.error('Error removing invalid mutations:', error);
        return 0;
    }
};