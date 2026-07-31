import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader, Zap } from "lucide-react";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    verifyEmail(token).then((result) => {
      if (result.success) {
        setStatus("success");
        toast.success("Email verified! Welcome to Polly 🎉");
        setTimeout(() => navigate("/home"), 2000);
      } else {
        setStatus("error");
        setErrorMsg(result.message || "Verification failed. The link may have expired.");
      }
    });
  }, []);

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 sm:p-10 border border-white/[0.08] text-center"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-8 w-fit mx-auto justify-center">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-['Outfit'] gradient-text">Polly</span>
          </Link>

          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader className="w-12 h-12 text-violet-400 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying your email…</h1>
              <p className="text-slate-500 text-sm">Just a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-violet-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-3">Email verified!</h1>
              <p className="text-slate-400 text-sm">Redirecting you to the app…</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-3">Verification failed</h1>
              <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
              <Link
                to="/register"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Back to register
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
