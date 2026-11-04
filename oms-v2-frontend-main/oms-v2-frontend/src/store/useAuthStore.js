import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

export const useAuthStore = create(devtools(set => ({
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    user: null,
    callLoginApi: false,
    emailVerified: false,
    permissions: [],
    leftSidebarMenu: [],
    // login: async (username, password) => {
    //     const response = await fetch('/api/login', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ username, password }),
    //     });
    //     const data = await response.json();
    //     if (response.ok) {
    //         set({ accessToken: data.access_token, tokenType: data.token_type, user: data.user });
    //     }    
    //     return data;
    // },
    setAuth: ({ accessToken, refreshToken, tokenType, user, callLoginApi }) =>
        set({ accessToken, refreshToken, tokenType, user, callLoginApi }),
    setPermissions: (permissions) => set({ permissions }),
    setLeftSidebarMenu: (leftSidebarMenu) => set({ leftSidebarMenu }),
    clearAuth: () =>
        set({ accessToken: null, tokenType: null, user: null, callLoginApi: false }),
    setEmailVerified: () => set({ emailVerified: true }),
    setEmailUnVerified: () => set({ emailVerified: false }),
})));