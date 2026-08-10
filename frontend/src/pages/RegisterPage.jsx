import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Zap, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import useAuthStore from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { register, resendVerification, isLoading } = useAuthStore();

  const handleResend = async () => {
    const result = await resendVerification(registeredEmail);
    if (result.success) {
      toast.success(result.message || "Verification email sent!");
    } else {
      toast.error(result.message);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.username) e.username = "Username is required";
    if (form.username && !/^[a-zA-Z0-9_]{3,}$/.test(form.username))
      e.username = "Min 3 chars, letters, numbers, underscores only";
    if (!form.password) e.password = "Password is required";
    if (form.password && form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await register(form);
    if (result.success) {
      setRegisteredEmail(form.email);
      setSubmitted(true);
    } else {
      toast.error(result.message);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: null }); },
    error: errors[key],
  });

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="check-email"
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
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                We sent a verification link to
              </p>
              <p className="text-violet-300 font-medium text-sm mb-6">{registeredEmail}</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Click the link in the email to verify your account and get started. The link expires in 15 minutes.
              </p>
              
              <div className="mt-6 space-y-4">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleResend}
                  isLoading={isLoading}
                >
                  Resend verification email
                </Button>
                <p className="text-slate-600 text-xs">
                  Already verified?{" "}
                  <Link to="/login" className="text-violet-400 hover:text-violet-300">
                    Sign in
                  </Link>
                </p>
              </div>
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

              <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-1">Create an account</h1>
              <p className="text-slate-500 text-sm mb-8">Start creating and participating in polls</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  {...field("email")}
                  required
                />
                <Input
                  label="Username"
                  type="text"
                  placeholder="yourhandle"
                  leftIcon={<User className="w-4 h-4" />}
                  {...field("username")}
                  required
                />
                <Input
                  label="Password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min 6 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="flex h-5 w-5 items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  {...field("password")}
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-2 glow-btn"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create account
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-8">
                Already have an account?{" "}
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
