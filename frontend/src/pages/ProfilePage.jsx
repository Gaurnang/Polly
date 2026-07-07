import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Key, BarChart3, Calendar, Save, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { formatDate } from "../lib/utils";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState({ username: "", email: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ username: user.username, email: user.email });
      api.get("/users/profile").then(({ data }) => setStats(data.data.user));
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", profileForm);
      updateUser(data.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error("Both fields required");
      return;
    }
    setSavingPw(true);
    try {
      await api.patch("/users/change-password", pwForm);
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center pt-20 md:pt-0 bg-[#090b10]"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-16 bg-[#090b10]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-white/[0.07]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-3xl font-bold text-white font-['Outfit'] shadow-lg shadow-violet-900/40">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-['Outfit'] text-white">{user.username}</h1>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                <Calendar className="w-3 h-3" />
                Joined {formatDate(user.created_at)}
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
              {[
                { icon: BarChart3, label: "Polls Created",      value: stats.polls_created },
                { icon: User,      label: "Polls Participated", value: stats.polls_participated },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                  <Icon className="w-5 h-5 text-violet-400 mb-2" />
                  <div className="text-2xl font-bold font-['Outfit'] text-white">{value ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Edit profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/[0.07]"
        >
          <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" /> Edit Profile
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Username"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Button type="submit" variant="outline" leftIcon={<Save className="w-4 h-4" />} isLoading={saving}>
              Save changes
            </Button>
          </form>
        </motion.div>

        {/* Change password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 border border-white/[0.07]"
        >
          <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <Key className="w-4 h-4 text-violet-400" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              leftIcon={<Key className="w-4 h-4" />}
            />
            <Input
              label="New Password"
              type={showPw ? "text" : "password"}
              placeholder="Min 6 characters"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              leftIcon={<Key className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="flex h-5 w-5 items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Button type="submit" variant="outline" leftIcon={<Save className="w-4 h-4" />} isLoading={savingPw}>
              Update password
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
