// path: src/store/networkStore.js
import { create } from 'zustand';

// Test actual internet connectivity
const testInternetConnection = async () => {

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Test against your own API first, then fallback to google
        const response = await fetch('/health-check', {
            method: 'GET',
            cache: 'no-cache',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.log('🔴 Internet connection test failed:', error.message);

        // Fallback test
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            await fetch('https://www.google.com/favicon.ico?t=' + Date.now(), {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return true;
        } catch (fallbackError) {
            console.log('🔴 Fallback connection test also failed');
            return false;
        }
    }
};

export const useNetworkStore = create((set, get) => ({
    isOnline: true, // Start as online (optimistic) - will be checked on initialization
    isChecking: false,
    isSyncing: false, // 🔑 NEW: State to track if the sync process is running
    lastChecked: null,

    // 🔑 NEW: Setter for sync status
    setSyncing: (isSyncing) => {
        set({ isSyncing });
        // console.log(`🔄 [Store] Syncing status set to: ${isSyncing}`);
    },

    setOnline: () => {
        const current = get().isOnline;
        if (!current) {
            console.log('🟢 [Store] Setting network status: Online');
            // Always update when we detect online status (removed cooldown to prevent stuck offline state)
            set({ isOnline: true, lastChecked: Date.now() });
            // Sync will be triggered by the subscription in layout.js
        } else {
            // Even if already online, update lastChecked timestamp
            set({ lastChecked: Date.now() });
        }
    },

    setOffline: () => {
        const current = get().isOnline;
        if (current) {
            console.log('🔴 [Store] Setting network status: Offline');
            set({ isOnline: false, lastChecked: Date.now() });
        }
    },

    setChecking: (checking) => set({ isChecking: checking }),

    checkStatus: async () => {
        if (get().isChecking) {
            // console.log('⏳ [Store] Already checking status, skipping...');
            return get().isOnline;
        }

        // console.log('🔍 [Store] Starting network status check...');
        set({ isChecking: true });

        try {
            // First check navigator (instant)
            // console.log('navigator.onLine', navigator.onLine);
            if (!navigator.onLine) {
                // console.log('🔴 [Store] Navigator reports offline');
                get().setOffline();
                return false;
            }

            // If navigator says online, trust it and set online immediately
            // Then test actual internet connectivity in the background
            get().setOnline();

            // Test actual internet connectivity (but don't fail if it times out)
            // console.log('🌐 [Store] Testing actual internet connectivity...');
            try {
                const hasInternet = await Promise.race([
                    testInternetConnection(),
                    new Promise((resolve) => setTimeout(() => resolve(false), 2000)) // 2 second timeout
                ]);

                if (hasInternet) {
                    // console.log('🟢 [Store] Internet connection confirmed');
                    get().setOnline();
                    return true;
                } else {
                    // If health check fails but navigator says online, trust navigator
                    // This prevents false offline states when health-check endpoint is slow
                    console.log('⚠️ [Store] Health check failed but navigator reports online. Trusting navigator.');
                    get().setOnline();
                    return true;
                }
            } catch (testError) {
                // If test fails but navigator says online, trust navigator
                console.log('⚠️ [Store] Health check error but navigator reports online. Trusting navigator.');
                get().setOnline();
                return true;
            }
        } catch (error) {
            // If navigator says online, trust it even if there's an error
            if (navigator.onLine) {
                console.log('⚠️ [Store] Error checking network but navigator reports online. Trusting navigator.');
                get().setOnline();
                return true;
            }
            // console.error('❌ [Store] Error checking network status:', error);
            get().setOffline();
            return false;
        } finally {
            set({ isChecking: false });
        }
    }
}));