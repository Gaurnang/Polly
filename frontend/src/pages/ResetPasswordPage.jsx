import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Zap, ArrowRight, Eye, EyeOff } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/password-reset/confirm", { token, newPassword });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 sm:p-10 border border-white/[0.08]"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-8 w-fit">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-['Outfit'] gradient-text">Polly</span>
          </Link>

          <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-1">Set new password</h1>
          <p className="text-slate-500 text-sm mb-8">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New password"
              type={showPw ? "text" : "password"}
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="flex h-5 w-5 items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
            <Input
              label="Confirm password"
              type={showPw ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 glow-btn"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Reset password
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
