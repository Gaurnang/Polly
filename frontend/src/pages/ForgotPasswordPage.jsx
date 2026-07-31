import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Zap, ArrowRight, CheckCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await api.post("/auth/password-reset/request", { email });
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-3xl p-8 sm:p-10 border border-white/[0.08] text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-violet-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-3">Check your email</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                If that email is registered, a reset link has been sent. Check your inbox and follow the link to reset your password.
              </p>
              <p className="text-slate-500 text-xs">The link expires in 30 minutes.</p>
              <p className="text-slate-600 text-xs mt-6">
                <Link to="/login" className="text-violet-400 hover:text-violet-300">
                  Back to sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-3xl p-8 sm:p-10 border border-white/[0.08]"
            >
              <Link to="/" className="flex items-center gap-2.5 mb-8 w-fit">
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold font-['Outfit'] gradient-text">Polly</span>
              </Link>

              <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-1">Forgot password?</h1>
              <p className="text-slate-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-2 glow-btn"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send reset link
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-8">
                Remember your password?{" "}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
