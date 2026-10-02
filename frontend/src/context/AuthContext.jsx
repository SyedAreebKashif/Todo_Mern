import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate existing token or session on initial load
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      localStorage.removeItem("todo_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    // identifier can be either email or username
    const payload = identifier.includes("@")
      ? { email: identifier, password }
      : { username: identifier, password };

    const res = await api.post("/auth/login", payload);
    if (res.data?.token) {
      localStorage.setItem("todo_token", res.data.token);
    }
    if (res.data?.user) {
      setUser(res.data.user);
    } else {
      // Fallback to fetch profile if user not in login response
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
    }
    return res.data;
  };

  const signup = async (username, email, password) => {
    const res = await api.post("/auth/signup", {
      username,
      email,
      password,
    });
    if (res.data?.token) {
      localStorage.setItem("todo_token", res.data.token);
    }
    if (res.data?.user) {
      setUser(res.data.user);
    } else {
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      localStorage.removeItem("todo_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
