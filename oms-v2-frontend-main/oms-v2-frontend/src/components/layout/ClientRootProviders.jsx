"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Slide, ToastContainer } from "react-toastify";
import i18n from "@/lang/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import Toast from "@/components/ui/Toast";
import OfflineIndicator from "@/components/OfflineIndicator";
import { useNetworkStore } from "@/utils/offline/networkStore";
import { syncMutations } from "@/utils/offline/syncService";
import RouteTracker from "@/app/RouteTracker";

export default function ClientRootProviders({ children }) {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const previousIsOnlineRef = useRef(isOnline);
  const lastSyncTimeRef = useRef(0);
  const SYNC_COOLDOWN = 5000;

  useEffect(() => {
    const justReconnected = !previousIsOnlineRef.current && isOnline;

    if (justReconnected) {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;

      if (timeSinceLastSync >= SYNC_COOLDOWN) {
        lastSyncTimeRef.current = now;
        syncMutations().catch((error) => {
          console.error("Error during sync:", error);
        });
      }
    }

    previousIsOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem("lang") || "en";
      i18n.changeLanguage(lang);
    }
  }, []);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      const selectedText = window.getSelection().toString();
      const activeElement = document.activeElement;
      const isInputField =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable;

      if (selectedText && !isInputField) {
        navigator.clipboard.writeText(selectedText);
        setCopied(true);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { checkStatus, setOnline, setOffline } = useNetworkStore.getState();
    checkStatus();

    const handleOnline = () => setOnline();
    const handleOffline = () => setOffline();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((regs) =>
      Promise.all(regs.map((reg) => reg.unregister()))
    ).then(() => {
      if (window.caches) {
        return caches.keys().then((keys) =>
          Promise.all(keys.map((key) => caches.delete(key)))
        );
      }
    });
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        transition={Slide}
        closeOnClick
      />

      <Toast message="Copied!" show={copied} onClose={() => setCopied(false)} />

      <ReactQueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <OfflineIndicator />
          <RouteTracker>{children}</RouteTracker>
        </ThemeProvider>
      </ReactQueryProvider>
    </>
  );
}
