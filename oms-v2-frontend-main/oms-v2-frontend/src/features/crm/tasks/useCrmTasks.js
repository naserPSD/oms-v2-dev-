"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const MOCK_TITLES = new Set([
  "Call Tanvir Hasan for contract signing",
  "Send revised proposal to Green Horizon",
  "Product demo with Nexus Logistics team",
  "Follow-up email regarding pricing tier",
  "Schedule product onboarding for Apex Digital",
  "Review custom SLA terms with Rahim Textile",
  "Prepare quarterly business review deck",
  "Follow up on overdue invoice #INV-2041",
  "Client feedback call with TechnoSoft Ltd",
  "Send NDA agreement to Vertex Partners",
  "Renew enterprise license for Alpha Corp",
  "Initial discovery meeting with BD Ventures",
]);

const MASTER_KEY = "crm_company_tasks_store_v2";
const IDB_NAME = "OmsCrmTasksDatabase";
const IDB_STORE = "crm_company_tasks";
const IDB_VERSION = 1;

// ─── IndexedDB Persistent Storage (Never wiped across user switching or logout) ────
function openCrmIdb() {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: "companyId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function saveTasksToIndexedDb(scopeKey, tasks, companyId, userId) {
  try {
    const db = await openCrmIdb();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    // Use scopeKey as the primary keyPath value so existing DB schema works seamlessly
    store.put({
      companyId: String(scopeKey),
      scopeKey: String(scopeKey),
      userId: userId ? String(userId) : null,
      appCompanyId: companyId ? String(companyId) : null,
      tasks: tasks || [],
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn("Failed saving CRM tasks to IndexedDB:", e);
  }
}

async function loadTasksFromIndexedDb(scopeKey, companyId) {
  try {
    const db = await openCrmIdb();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);

      const req = store.get(String(scopeKey));
      req.onsuccess = () => {
        const record = req.result;
        if (record && Array.isArray(record.tasks) && record.tasks.length > 0) {
          resolve(record.tasks);
          return;
        }

        // Fallback: check by companyId if different from scopeKey
        if (companyId && String(companyId) !== String(scopeKey)) {
          const reqComp = store.get(String(companyId));
          reqComp.onsuccess = () => {
            const compRecord = reqComp.result;
            if (compRecord && Array.isArray(compRecord.tasks) && compRecord.tasks.length > 0) {
              resolve(compRecord.tasks);
              return;
            }
            // Fallback: check "default"
            const reqDef = store.get("default");
            reqDef.onsuccess = () => {
              const defRecord = reqDef.result;
              if (defRecord && Array.isArray(defRecord.tasks) && defRecord.tasks.length > 0) {
                resolve(defRecord.tasks);
              } else {
                resolve(null);
              }
            };
            reqDef.onerror = () => resolve(null);
          };
          reqComp.onerror = () => resolve(null);
        } else {
          // Check "default"
          const reqDef = store.get("default");
          reqDef.onsuccess = () => {
            const defRecord = reqDef.result;
            if (defRecord && Array.isArray(defRecord.tasks) && defRecord.tasks.length > 0) {
              resolve(defRecord.tasks);
            } else {
              resolve(null);
            }
          };
          reqDef.onerror = () => resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

// ─── Active User & Company Resolution ──────────────────────────────────────────────
export function getActiveUserAndCompany() {
  if (typeof window === "undefined") {
    return { userId: "default_user", companyId: "default", scopeKey: "default" };
  }
  let userId = null;
  let companyId = null;

  try {
    // 1. From Zustand authStore user
    const user = useAuthStore.getState().user;
    if (user?.id != null && user.id !== "") {
      userId = String(user.id);
    } else if (user?.email) {
      userId = String(user.email);
    }

    const fromUserApp = user?.activeApp?.id || user?.activeAppId || user?.appId;
    if (fromUserApp != null && fromUserApp !== "") {
      companyId = String(fromUserApp);
    }

    // 2. From localStorage
    if (!userId) {
      const localUserRaw = localStorage.getItem("user");
      if (localUserRaw) {
        try {
          const parsed = JSON.parse(localUserRaw);
          if (parsed?.id != null && parsed.id !== "") userId = String(parsed.id);
          else if (parsed?.email) userId = String(parsed.email);
          if (!companyId && (parsed?.activeAppId || parsed?.activeApp?.id)) {
            companyId = String(parsed.activeAppId || parsed.activeApp?.id);
          }
        } catch (e) {}
      }
    }

    if (!companyId) {
      const fromLocalApp = localStorage.getItem("activeAppId");
      if (fromLocalApp && fromLocalApp !== "null" && fromLocalApp !== "undefined") {
        companyId = String(fromLocalApp);
      }
    }

    // 3. Decode from JWT accessToken (synchronous & reliable on refresh)
    const token = localStorage.getItem("accessToken");
    if (token && typeof token === "string" && token.includes(".")) {
      try {
        const parts = token.split(".");
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          if (!userId && payload?.id != null) userId = String(payload.id);
          if (!userId && payload?.email) userId = String(payload.email);
          if (!companyId && (payload?.activeAppId || payload?.appId)) {
            companyId = String(payload.activeAppId || payload.appId);
          }
        }
      } catch (e) {}
    }
  } catch (e) {}

  userId = userId || "default_user";
  companyId = companyId || "default";

  // Primary isolation key is the user ID.
  // Each user has their own persistent task workspace so switching users never clears or overwrites data.
  const scopeKey = userId !== "default_user" ? `user_${userId}` : `comp_${companyId}`;

  return { userId, companyId, scopeKey };
}

export function getActiveCompanyId() {
  return getActiveUserAndCompany().companyId;
}

function getMasterStore() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MASTER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {}
  return {};
}

function saveMasterStore(store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MASTER_KEY, JSON.stringify(store));
  } catch (e) {}
}

export function loadStoredTasks(scopeKeyArg, companyIdArg) {
  if (typeof window === "undefined") return [];
  const { scopeKey, companyId } = getActiveUserAndCompany();
  const targetScope = scopeKeyArg && scopeKeyArg !== "" ? String(scopeKeyArg) : scopeKey;
  const targetCompany = companyIdArg && companyIdArg !== "" ? String(companyIdArg) : companyId;

  try {
    const store = getMasterStore();
    let tasks = Array.isArray(store[targetScope]) ? store[targetScope] : null;

    // Check localStorage direct key for this scope
    if (!tasks || tasks.length === 0) {
      const directKey = `crm_tasks_${targetScope}`;
      const directRaw = localStorage.getItem(directKey);
      if (directRaw) {
        try {
          const parsed = JSON.parse(directRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            tasks = parsed;
          }
        } catch (e) {}
      }
    }

    // Fallbacks if user scope is brand new: check company or default legacy keys
    if (!tasks || tasks.length === 0) {
      const fallbacks = [
        `crm_tasks_company_${targetCompany}`,
        store[targetCompany],
        store[`company_${targetCompany}`],
        store["default"],
        localStorage.getItem("crm_tasks_company_default"),
      ];

      for (const fb of fallbacks) {
        let candidates = null;
        if (Array.isArray(fb) && fb.length > 0) {
          candidates = fb;
        } else if (typeof fb === "string" && fb) {
          try {
            const parsed = JSON.parse(fb);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidates = parsed;
            }
          } catch (e) {}
        }

        if (candidates && candidates.length > 0) {
          tasks = candidates;
          // Cache under target scope without destructively deleting source!
          store[targetScope] = candidates;
          saveMasterStore(store);
          try {
            localStorage.setItem(`crm_tasks_${targetScope}`, JSON.stringify(candidates));
          } catch (e) {}
          break;
        }
      }
    }

    if (Array.isArray(tasks)) {
      // Filter out mock titles and remove duplicates by id
      const seen = new Set();
      const filtered = tasks.filter((t) => {
        if (!t || !t.title || MOCK_TITLES.has(t.title)) return false;
        if (t.id && seen.has(t.id)) return false;
        if (t.id) seen.add(t.id);
        return true;
      });

      store[targetScope] = filtered;
      saveMasterStore(store);
      try {
        localStorage.setItem(`crm_tasks_${targetScope}`, JSON.stringify(filtered));
      } catch (e) {}

      return filtered;
    }
  } catch (e) {
    console.error("Error loading CRM tasks:", e);
  }
  return [];
}

export function persistTasks(scopeKeyArg, tasks, companyIdArg, userIdArg) {
  if (typeof window === "undefined") return;
  const { scopeKey, companyId, userId } = getActiveUserAndCompany();
  const targetScope = scopeKeyArg && scopeKeyArg !== "" ? String(scopeKeyArg) : scopeKey;
  const targetCompany = companyIdArg && companyIdArg !== "" ? String(companyIdArg) : companyId;
  const targetUser = userIdArg && userIdArg !== "" ? String(userIdArg) : userId;

  try {
    const filtered = (tasks || []).filter(
      (t) => t && t.title && !MOCK_TITLES.has(t.title)
    );
    const store = getMasterStore();
    store[targetScope] = filtered;
    saveMasterStore(store);

    try {
      localStorage.setItem(`crm_tasks_${targetScope}`, JSON.stringify(filtered));
      // Also keep legacy company key updated for backward compatibility
      if (targetCompany && targetCompany !== "default") {
        localStorage.setItem(`crm_tasks_company_${targetCompany}`, JSON.stringify(filtered));
      }
    } catch (e) {}

    // Permanently back up in IndexedDB (survives logout / localStorage.clear)
    saveTasksToIndexedDb(targetScope, filtered, targetCompany, targetUser);
  } catch (e) {
    console.error("Error persisting CRM tasks:", e);
  }
}

export function useCrmTasks() {
  const authUser = useAuthStore((state) => state.user);

  // Dynamically resolve active scope from Zustand authUser or fallback
  const activeScope = useMemo(() => {
    let uid = authUser?.id != null ? String(authUser.id) : (authUser?.email ? String(authUser.email) : null);
    let cid = authUser?.activeApp?.id != null
      ? String(authUser.activeApp.id)
      : authUser?.activeAppId != null
      ? String(authUser.activeAppId)
      : authUser?.appId != null
      ? String(authUser.appId)
      : null;

    if (!uid || !cid) {
      const fallback = getActiveUserAndCompany();
      if (!uid) uid = fallback.userId;
      if (!cid) cid = fallback.companyId;
    }

    const scopeKey = uid && uid !== "default_user" ? `user_${uid}` : `comp_${cid || "default"}`;
    return { userId: uid, companyId: cid || "default", scopeKey };
  }, [authUser]);

  const [taskList, setTaskList] = useState(() => loadStoredTasks(activeScope.scopeKey, activeScope.companyId));

  // Sync state when activeScope changes (switching users loads that user's tasks)
  useEffect(() => {
    const tasks = loadStoredTasks(activeScope.scopeKey, activeScope.companyId);
    setTaskList(tasks);

    // Check IndexedDB backup if localStorage was cleared
    loadTasksFromIndexedDb(activeScope.scopeKey, activeScope.companyId).then((idbTasks) => {
      if (Array.isArray(idbTasks) && idbTasks.length > 0) {
        const filtered = idbTasks.filter((t) => t && t.title && !MOCK_TITLES.has(t.title));
        if (filtered.length > 0) {
          persistTasks(activeScope.scopeKey, filtered, activeScope.companyId, activeScope.userId);
          setTaskList(filtered);
        }
      }
    });
  }, [activeScope.scopeKey, activeScope.companyId, activeScope.userId]);

  // Listen to cross-component or cross-tab updates
  useEffect(() => {
    const handleUpdate = (e) => {
      const targetScope = e?.detail?.scopeKey;
      if (!targetScope || String(targetScope) === String(activeScope.scopeKey)) {
        const tasks = loadStoredTasks(activeScope.scopeKey, activeScope.companyId);
        setTaskList(tasks);
      }
    };

    const handleStorage = (e) => {
      if (e.key === MASTER_KEY || e.key === `crm_tasks_${activeScope.scopeKey}`) {
        const tasks = loadStoredTasks(activeScope.scopeKey, activeScope.companyId);
        setTaskList(tasks);
      }
    };

    window.addEventListener("crm_tasks_updated", handleUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("crm_tasks_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [activeScope.scopeKey, activeScope.companyId]);

  const saveTasks = useCallback(
    (newTasks) => {
      const filtered = newTasks.filter((t) => !MOCK_TITLES.has(t.title));
      persistTasks(activeScope.scopeKey, filtered, activeScope.companyId, activeScope.userId);
      setTaskList(filtered);

      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("crm_tasks_updated", { detail: { scopeKey: activeScope.scopeKey } })
          );
        }
      }, 0);
    },
    [activeScope]
  );

  const toggleTask = useCallback(
    (id) => {
      const currentTasks = loadStoredTasks(activeScope.scopeKey, activeScope.companyId);
      const updated = currentTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );

      persistTasks(activeScope.scopeKey, updated, activeScope.companyId, activeScope.userId);
      setTaskList(updated);

      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("crm_tasks_updated", { detail: { scopeKey: activeScope.scopeKey } })
          );
        }
      }, 0);

      return updated;
    },
    [activeScope]
  );

  const deleteTask = useCallback(
    (id) => {
      const currentTasks = loadStoredTasks(activeScope.scopeKey, activeScope.companyId);
      const updated = currentTasks.filter((t) => t.id !== id);

      persistTasks(activeScope.scopeKey, updated, activeScope.companyId, activeScope.userId);
      setTaskList(updated);

      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("crm_tasks_updated", { detail: { scopeKey: activeScope.scopeKey } })
          );
        }
      }, 0);

      return updated;
    },
    [activeScope]
  );

  const addTask = useCallback(
    (taskData) => {
      const newTask = {
        id: `${activeScope.scopeKey}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: taskData.title.trim(),
        contact: taskData.contact?.trim() || "General",
        date: taskData.date?.trim() || "Today",
        priority: taskData.priority || "Normal",
        completed: false,
        userId: activeScope.userId,
        companyId: activeScope.companyId,
      };

      const currentTasks = loadStoredTasks(activeScope.scopeKey, activeScope.companyId);
      const updated = [newTask, ...currentTasks.filter((t) => t.id !== newTask.id)];

      // Persist to storage (both localStorage and IndexedDB) FIRST
      persistTasks(activeScope.scopeKey, updated, activeScope.companyId, activeScope.userId);

      // Update state
      setTaskList(updated);

      // Notify other components asynchronously
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("crm_tasks_updated", { detail: { scopeKey: activeScope.scopeKey } })
          );
        }
      }, 0);

      return newTask;
    },
    [activeScope]
  );

  return {
    taskList,
    addTask,
    toggleTask,
    deleteTask,
    saveTasks,
    companyId: activeScope.companyId,
    userId: activeScope.userId,
    scopeKey: activeScope.scopeKey,
  };
}
