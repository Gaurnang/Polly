import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import HomePage        from "./pages/HomePage";
import PollDetailPage  from "./pages/PollDetailPage";
import CreatePollPage  from "./pages/CreatePollPage";
import MyPollsPage     from "./pages/MyPollsPage";
import MyVotedPollsPage from "./pages/MyVotedPollsPage";
import BookmarksPage   from "./pages/BookmarksPage";
import ProfilePage     from "./pages/ProfilePage";
import useAuthStore    from "./stores/authStore";

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#161625",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#7c3aed", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />

      <Navbar />

      <main className={isAuthenticated ? "md:pl-64" : ""}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

          {/* Semi-public (polls visible to all, bookmark needs auth) */}
          <Route path="/home"       element={<HomePage />} />
          <Route path="/polls/:id"  element={<PollDetailPage />} />

          {/* Protected */}
          <Route path="/create"    element={<ProtectedRoute><CreatePollPage /></ProtectedRoute>} />
          <Route path="/my-polls"  element={<ProtectedRoute><MyPollsPage /></ProtectedRoute>} />
          <Route path="/my-votes"  element={<ProtectedRoute><MyVotedPollsPage /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
