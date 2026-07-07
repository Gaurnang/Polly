import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  CheckCircle2,
  Home,
  LogOut,
  Menu,
  Plus,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import useAuthStore from "../../stores/authStore";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const appLinks = [
  { to: "/home", label: "Dashboard", icon: Home },
  { to: "/my-polls", label: "My Polls", icon: BarChart3 },
  { to: "/my-votes", label: "My Voted Polls", icon: CheckCircle2 },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublic = !isAuthenticated;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  if (isPublic) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#08080f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </span>
            <span className="text-lg font-bold font-['Outfit'] text-white">Polly</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              Sign up
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#0b0d12]/95 backdrop-blur-xl">
        <div className="h-16 px-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </span>
            <span className="text-lg font-bold font-['Outfit'] text-white">Polly</span>
          </Link>
          <button
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:bg-white/6"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <button
          aria-label="Close navigation overlay"
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed z-50 md:z-40 top-0 bottom-0 left-0 w-72 md:w-64 border-r border-white/[0.07] bg-[#0b0d12] transition-transform duration-200
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-7">
            <Link to="/home" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
              <span className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </span>
              <div>
                <p className="text-lg font-bold font-['Outfit'] text-white leading-none">Polly</p>
                <p className="text-[11px] text-slate-500 mt-1">Live polling workspace</p>
              </div>
            </Link>
            <button
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-white/6"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Button
            className="w-full mb-5"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setMenuOpen(false);
              navigate("/create");
            }}
          >
            New Poll
          </Button>

          <nav className="space-y-1">
            {appLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to === "/home" && location.pathname === "/polls");
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? "bg-violet-500/16 text-violet-200"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-white/[0.07]">
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
