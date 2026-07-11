import { create } from "zustand";
import api from "../api/axios";

// Normalize legacy poll_type values from DB to match the app's type system
const normalizeType = (t) => {
  if (t === "single_choice" || t === "multiple_choice" || t === "multiple") return "single";
  return t;
};

const normalizePoll = (p) => ({ ...p, poll_type: normalizeType(p.poll_type) });

const usePollStore = create((set, get) => ({
  polls: [],
  currentPoll: null,
  myPolls: [],
  myVotedPolls: [],
  bookmarks: [],
  currentResults: null,
  isLoading: false,
  isSubmitting: false,

  // ── Polls ──────────────────────────────────────────────
  fetchPolls: async (params = {}, append = false) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/polls", { params });
      const responseData = data.data || {};
      const fetchedPolls = responseData.polls || [];
      const newPolls = fetchedPolls.map(normalizePoll);
      
      set((state) => ({
        polls: append ? [...state.polls, ...newPolls] : newPolls,
      }));
      
      return { newPolls, pagination: responseData.pagination };
    } catch (err) {
      console.error("fetchPolls failed:", err?.response?.data || err.message);
      if (!append) set({ polls: [] });
      return { newPolls: [], pagination: null };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPollById: async (id) => {
    set({ isLoading: true, currentPoll: null });
    try {
      const { data } = await api.get(`/polls/${id}`);
      const poll = normalizePoll(data.data.poll);
      set({ currentPoll: poll });
      return poll;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createPoll: async (payload) => {
    set({ isSubmitting: true });
    try {
      const { data } = await api.post("/polls", payload);
      const newPoll = data.data.poll;
      set((s) => ({ polls: [newPoll, ...s.polls], myPolls: [newPoll, ...s.myPolls] }));
      return { success: true, poll: newPoll };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to create poll." };
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePoll: async (id, payload) => {
    set({ isSubmitting: true });
    try {
      const { data } = await api.put(`/polls/${id}`, payload);
      const updated = data.data.poll;
      set((s) => ({
        polls: s.polls.map((p) => (p.id === updated.id ? updated : p)),
        myPolls: s.myPolls.map((p) => (p.id === updated.id ? updated : p)),
        currentPoll: s.currentPoll?.id === updated.id ? updated : s.currentPoll,
      }));
      return { success: true, poll: updated };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update." };
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePoll: async (id) => {
    try {
      await api.delete(`/polls/${id}`);
      set((s) => ({
        polls: s.polls.filter((p) => p.id !== id),
        myPolls: s.myPolls.filter((p) => p.id !== id),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete." };
    }
  },

  closePoll: async (id) => {
    try {
      const { data } = await api.patch(`/polls/${id}/close`);
      const updated = data.data.poll;
      set((s) => ({
        myPolls: s.myPolls.map((p) => (p.id === updated.id ? { ...p, is_active: false } : p)),
        polls: s.polls.map((p) => (p.id === updated.id ? { ...p, is_active: false } : p)),
        currentPoll: s.currentPoll?.id === updated.id ? { ...s.currentPoll, is_active: false } : s.currentPoll,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to close poll." };
    }
  },

  // ── My Polls ───────────────────────────────────────────
  fetchMyPolls: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/my-polls");
      set({ myPolls: (data.data.polls ?? []).map(normalizePoll) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyVotedPolls: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/my-votes");
      set({ myVotedPolls: (data.data.polls ?? []).map(normalizePoll) });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Responses ──────────────────────────────────────────
  submitResponse: async (pollId, payload) => {
    set({ isSubmitting: true });
    try {
      await api.post(`/polls/${pollId}/respond`, payload);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to submit response." };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Results ────────────────────────────────────────────
  fetchResults: async (pollId) => {
    try {
      const { data } = await api.get(`/polls/${pollId}/results`);
      set({ currentResults: data.data });
      return data.data;
    } catch {
      return null;
    }
  },

  clearResults: () => set({ currentResults: null }),

  // ── Bookmarks ──────────────────────────────────────────
  fetchBookmarks: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/bookmarks");
      set({ bookmarks: data.data.bookmarks });
    } finally {
      set({ isLoading: false });
    }
  },

  addBookmark: async (pollId) => {
    try {
      await api.post(`/bookmarks/${pollId}`);
      set((s) => ({ bookmarks: [...s.bookmarks, { poll_id: pollId }] }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  removeBookmark: async (pollId) => {
    try {
      await api.delete(`/bookmarks/${pollId}`);
      set((s) => ({ bookmarks: s.bookmarks.filter((b) => String(b.poll_id) !== String(pollId)) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  isBookmarked: (pollId) => {
    return get().bookmarks.some((b) => String(b.poll_id) === String(pollId));
  },
}));

export default usePollStore;
