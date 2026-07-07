import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, BarChart3, Bookmark, Users, ArrowRight, CheckCircle } from "lucide-react";
import Button from "../components/ui/Button";

const features = [
  { icon: BarChart3, title: "5 Poll Types",      desc: "Single choice, multi-choice, rating, text, or yes/no — every format covered."        },
  { icon: Users,     title: "Real-time Results", desc: "See live aggregated results with beautiful charts as votes come in."                  },
  { icon: Bookmark,  title: "Bookmark Polls",    desc: "Save polls you care about and revisit them anytime from your bookmarks."              },
  { icon: Zap,       title: "Instant Setup",     desc: "Create a poll in seconds, share the link, and start collecting responses immediately." },
];

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="hero-bg noise min-h-screen">
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8"
        >
          <div className="active-dot" />
          Polling made beautiful
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-['Outfit'] leading-[1.08] tracking-tight mb-6"
        >
          Collect opinions,
          <br />
          <span className="gradient-text">understand people.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Polly is a modern polling platform where you can create any type of poll,
          gather responses in real-time, and explore stunning visualized results — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            size="xl"
            onClick={() => navigate("/register")}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="glow-btn"
          >
            Get started — free
          </Button>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => navigate("/home")}
          >
            Browse polls
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-12 text-sm text-slate-500"
        >
          {["No credit card required", "Open to anyone", "Instant results"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-violet-500" />
              {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <FadeUp>
          <h2 className="text-3xl font-bold font-['Outfit'] text-center text-slate-100 mb-12">
            Everything you need to run polls
          </h2>
        </FadeUp>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.1}>
              <div className="glass glass-hover rounded-2xl p-6 group">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/25 flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors">
                  <Icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2 text-lg">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Poll types showcase */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-24">
        <FadeUp>
          <div className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-500/5 pointer-events-none" />
            <h2 className="text-3xl font-bold font-['Outfit'] text-slate-100 mb-3 relative">
              Ready to hear from your audience?
            </h2>
            <p className="text-slate-400 mb-8 relative">
              Join thousands of creators making data-driven decisions with Polly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
              <Button size="lg" onClick={() => navigate("/register")} className="glow-btn">
                Create your first poll
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/login")}>
                Sign in
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
