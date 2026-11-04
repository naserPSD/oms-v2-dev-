import { create } from 'zustand';
import { devtools } from 'zustand/middleware'

export const useMenuStore = create(devtools(set => ({
    leftSidebarMenu: [],
    setLeftSidebarMenu: (leftSidebarMenu) => set({ leftSidebarMenu }),
    clearLeftSidebarMenu: () => set({ leftSidebarMenu: [] }),
})));