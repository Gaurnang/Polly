import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      register: async ({ email, username, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", { email, username, password });
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message || "Registration failed." };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async ({ email, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message || "Login failed." };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await api.post("/auth/logout"); } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      loadUser: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) => {
        set((s) => ({ user: { ...s.user, ...updates } }));
      },
    }),
    {
      name: "polly_auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
