// path: src/components/OfflineIndicator.js
'use client';
import { useNetworkStatus } from '@/utils/offline/useNetworkStatus';
import { MdOutlineWifiOff, MdSync, MdWifi, MdRefresh } from 'react-icons/md';
import { useEffect, useState, useRef } from 'react'; // Import useRef
import { getQueue } from '@/utils/offline/offlineQueue';
import { useNetworkStore } from '@/utils/offline/networkStore';

const OfflineIndicator = () => {
    const { isOnline, isInitialized } = useNetworkStatus();
    const [pendingChanges, setPendingChanges] = useState(0);
    const [debugInfo, setDebugInfo] = useState('');
    const { checkStatus } = useNetworkStore();

    // 1. New state to control the visibility of the "Online" message
    const [showOnlineMessage, setShowOnlineMessage] = useState(false);

    // 2. Use useRef to store the previous isOnline value without causing re-renders
    const wasOnline = useRef(isOnline);

    useEffect(() => {
        const updatePendingCount = async () => {
            try {
                const queue = await getQueue();
                setPendingChanges(queue.length);

                // Debug info
                const storeStatus = useNetworkStore.getState().isOnline;
                setDebugInfo(`Store: ${storeStatus ? 'Online' : 'Offline'} | Navigator: ${navigator.onLine ? 'Online' : 'Offline'} | Queue: ${queue.length}`);
            } catch (error) {
                console.error('Error updating pending count:', error);
            }
        };

        if (!isInitialized) return;

        updatePendingCount();
        const interval = setInterval(updatePendingCount, 3000);

        return () => clearInterval(interval);
    }, [isOnline, isInitialized]);

    // 3. Effect to handle the 5-second online message on reconnection
    // Use a ref to track if we've already shown the message for this reconnection
    const hasShownMessageRef = useRef(false);
    const lastOfflineTimeRef = useRef(null);
    
    useEffect(() => {
        // Only run the logic after initialization
        if (!isInitialized) {
            // Set the initial state of the ref
            wasOnline.current = isOnline;
            return;
        }

        // Check for a transition from offline (false) to online (true)
        const justReconnected = !wasOnline.current && isOnline;
        
        // If we just went offline, reset the message flag and record the time
        if (!isOnline && wasOnline.current) {
            hasShownMessageRef.current = false;
            lastOfflineTimeRef.current = Date.now();
        }

        if (justReconnected) {
            // Only show message if we haven't shown it recently (prevent flickering)
            const timeSinceOffline = lastOfflineTimeRef.current 
                ? Date.now() - lastOfflineTimeRef.current 
                : Infinity;
            
            // Only show if we were offline for at least 2 seconds (prevents flickering)
            if (!hasShownMessageRef.current && timeSinceOffline >= 2000) {
                console.log('⚡️ Reconnection detected. Showing online message.');
                setShowOnlineMessage(true);
                hasShownMessageRef.current = true;

                // Hide the message after 5 seconds
                const timer = setTimeout(() => {
                    setShowOnlineMessage(false);
                    console.log('Online message hidden.');
                }, 5000); // 5000 milliseconds = 5 seconds

                // Cleanup function
                return () => clearTimeout(timer);
            } else {
                console.log('⏳ Reconnection detected but message already shown or too soon. Skipping.');
            }
        } else if (!isOnline) {
            // If we're offline, ensure the message is hidden
            setShowOnlineMessage(false);
        }

        // 4. Always update the ref with the *current* state at the end of the effect
        wasOnline.current = isOnline;
    }, [isOnline, isInitialized]); // Dependency on isOnline to detect changes

    const handleManualCheck = async () => {
        console.log('🔄 Manual network check requested');
        await checkStatus();
    };

    if (!isInitialized) {
        return (
            <div className="fixed bottom-4 right-4 bg-gray-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
                <div className="flex items-center">
                    <MdWifi className="animate-pulse" />
                    <span className='ml-2'>Checking network...</span>
                </div>
            </div>
        );
    }

    // 5. Determine if the online indicator should be rendered
    const showOnlineIndicator = isOnline && showOnlineMessage;

    return (
        <>
            {/* Debug Info - Hidden by default, can be enabled if needed */}
            {false && process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-6 left-16 bg-blue-500 text-white px-3 py-1 rounded-md text-xs z-50">
                    <div className="flex items-center space-x-2">
                        <span>{debugInfo || 'Loading...'}</span>
                        <button
                            onClick={handleManualCheck}
                            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                            title="Check network status"
                        >
                            <MdRefresh size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* Offline Indicator - Only show if actually offline (not during initialization) */}
            {!isOnline && isInitialized && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    <div className="flex items-center">
                        <MdOutlineWifiOff />
                        <span className='ml-2'>
                            You are offline. {pendingChanges > 0 &&
                                <span className="flex items-center ml-2">
                                    <MdSync className="animate-spin mr-1" />
                                    {pendingChanges} change(s) pending sync
                                </span>
                            }
                        </span>
                    </div>
                </div>
            )}

            {/* Online Indicator (Conditional rendering based on new state) */}
            {showOnlineIndicator && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-500">
                    <div className="flex items-center">
                        <MdWifi />
                        <span className='ml-2'>You are online</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default OfflineIndicator;