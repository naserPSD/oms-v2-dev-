// path: src/providers/ReactQueryProvider.js
'use client';

import { initDB } from '@/utils/offline/offlineDB';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';


const staleTime = 1000 * 30; // 30s
const cacheTime = 1000 * 60; // 60s

// Make queryClient a global export
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: staleTime,         // fresh for 30s
            gcTime: cacheTime,           // cache kept for 60s after last unmount
            refetchOnMount: (query) => {
                if (!query.state.data) return true;
                const now = Date.now();
                const age = now - query.state.dataUpdatedAt;
                const cacheExpired = age > cacheTime;
                return cacheExpired;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: false, // We'll manually trigger after sync
            // refetchOnMount: false, // Only refetch if data is stale
            // refetchOnMount: 'always', // Force refetch every mount
            // refetchInterval: 1000 * 5, // this for periodic refresh (every 5 seconds after api will call)
            // refetchIntervalInBackground: true // Keep refetching even when tab inactive
            // staleTime: 1000 * 60 * 5, // 5 minutes
            // cacheTime: 1000 * 60 * 30, // 30 minutes
        },
    },
});

export default function ReactQueryProvider({ children }) {

    // Initialize offline database
    useEffect(() => {
        initDB().catch(console.error);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
