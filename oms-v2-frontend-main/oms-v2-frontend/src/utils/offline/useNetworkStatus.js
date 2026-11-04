// path: src/utils/useNetworkStatus.js
import { useEffect, useState } from 'react';
import { useNetworkStore } from '@/utils/offline/networkStore';

export const useNetworkStatus = () => {
    const { isOnline, checkStatus } = useNetworkStore();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // console.log('🔌 Initializing network status hook...');

        const initialize = async () => {
            // Set initialized to true first (optimistic) so UI doesn't show offline during check
            setIsInitialized(true);
            // Then check status in background
            checkStatus().catch(err => {
                console.error('Error checking network status:', err);
                // Don't block initialization if check fails
            });
            // console.log('✅ Network status hook initialized');
        };

        initialize();

        const handleOnline = async () => {
            // console.log('🟢 [Hook] Browser online event received');
            // Wait a moment then re-check (browser can be over-optimistic)
            setTimeout(async () => {
                await checkStatus();
            }, 1000);
        };

        const handleOffline = () => {
            // console.log('🔴 [Hook] Browser offline event received');
            useNetworkStore.getState().setOffline();
        };

        // Check network status periodically (every 50 seconds)
        const interval = setInterval(() => {
            // console.log('🕒 Periodic network check...');
            checkStatus();
        }, 50000);

        // Add visibility change listener (when tab becomes active)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // console.log('👀 Tab became visible, checking network...');
                setTimeout(() => checkStatus(), 500);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, [checkStatus]);

    return { isOnline, isInitialized };
};