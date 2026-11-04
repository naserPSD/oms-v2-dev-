// store/useSupportStore.js
import { create } from "zustand";

export const useSupportStore = create((set) => ({
    openId: null,
    toggle: (id) =>
        set((state) => ({
            openId: state.openId === id ? null : id,
        })),
}));