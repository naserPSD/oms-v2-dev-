"use client";
import { createContext, useState, useContext, useEffect } from "react";
// import { BASE_URL } from "@/utils/baseURL";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // ✅ Fetch user with token
  // const fetchUser = async (accessToken) => {
  //   try {
  //     const response = await fetch("/api/proxy/user", {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });

  //     if (!response.ok) throw new Error("Failed to fetch user");

  //     const data = await response.json();
  //     setUser(data);
  //   } catch (error) {
  //     console.error("Fetch user error:", error);
  //     setUser(null);
  //   }
  // };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        // Safely parse user data
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === "object") {
              setUser(parsedUser);
            }
          } catch (e) {
            console.error("Failed to parse user data:", e);
            localStorage.removeItem("user");
          }
        }

        // if (storedToken) {
        //   setToken(storedToken);
        //   await fetchUser(storedToken); // ✅ Fetch user with token
        // }

        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        // Small delay to prevent flicker
        setTimeout(() => setLoading(false), 100);
      }
    };

    initializeAuth();
  }, []);
  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`/api/proxy/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false); // Ensure loading is false when done
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`/api/proxy/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false); // Ensure loading is false when done
    }
  };

  const logout = () => {
    try {
      const preserved = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("crm_") ||
            key.startsWith("crm-") ||
            key.includes("crm_tasks") ||
            key.includes("tasks_store"))
        ) {
          preserved[key] = localStorage.getItem(key);
        }
      }
      localStorage.clear();
      Object.entries(preserved).forEach(([k, v]) => {
        if (v !== null) localStorage.setItem(k, v);
      });
    } catch (e) {
      try { localStorage.clear(); } catch (err) {}
    }
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/sign-in");
    setLoading(false); // Set loading to false immediately after
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, loginUser, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
