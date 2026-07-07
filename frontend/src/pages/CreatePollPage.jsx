import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowRight, Sparkles } from "lucide-react";
import usePollStore from "../stores/pollStore";
import Button from "../components/ui/Button";
import { POLL_TYPE_META } from "../lib/utils";
import toast from "react-hot-toast";

const TYPE_CONFIGS = {
  single:  { desc: "Respondents pick exactly one option from your list.",  needsOptions: true  },
  rating:  { desc: "Respondents rate on a 1–5 star scale.",                needsOptions: false },
  text:    { desc: "Respondents type a free-text answer.",                  needsOptions: false },
  boolean: { desc: "Respondents choose Yes or No.",                         needsOptions: false },
};

const POLL_TYPES = Object.keys(TYPE_CONFIGS);

export default function CreatePollPage() {
  const navigate = useNavigate();
  const { createPoll, isSubmitting } = usePollStore();

  const [question, setQuestion]   = useState("");
  const [pollType, setPollType]   = useState("single");
  const [options,  setOptions]    = useState(["", ""]);

  const addOption    = ()    => setOptions([...options, ""]);
  const removeOption = (i)   => setOptions(options.filter((_, idx) => idx !== i));
  const setOption    = (i,v) => setOptions(options.map((o, idx) => idx === i ? v : o));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) { toast.error("Enter a poll question"); return; }

    const cfg = TYPE_CONFIGS[pollType];
    let payload = { question: question.trim(), poll_type: pollType };

    if (cfg.needsOptions) {
      const clean = options.map((o) => o.trim()).filter(Boolean);
      if (clean.length < 2) { toast.error("Provide at least 2 options"); return; }
      payload.options = clean;
    }

    const result = await createPoll(payload);
    if (result.success) {
      toast.success("Poll created");
      navigate("/home");
    } else {
      toast.error(result.message);
    }
  };

  const cfg = TYPE_CONFIGS[pollType];

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-16 bg-[#090b10]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" /> Create
          </div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white">New Poll</h1>
          <p className="text-slate-500 mt-1">Choose a type and craft your question</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Poll type selector */}
          <div className="glass rounded-2xl p-6 border border-white/[0.07]">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Poll Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {POLL_TYPES.map((type) => {
                const meta = POLL_TYPE_META[type];
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setPollType(type)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border transition-all duration-150 cursor-pointer text-left
                      ${pollType === type
                        ? "border-violet-500/60 bg-violet-500/15 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-violet-500/25 hover:bg-violet-500/5"}`}
                  >
                    <span className="text-lg mb-1">{meta.icon}</span>
                    <span className={`text-xs font-semibold ${pollType === type ? "text-violet-300" : "text-slate-400"}`}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {cfg.desc && (
              <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                <span className="text-violet-500 mt-0.5">→</span> {cfg.desc}
              </p>
            )}
          </div>

          {/* Question */}
          <div className="glass rounded-2xl p-6 border border-white/[0.07]">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Your Question</h2>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="What do you want to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <p className="text-xs text-slate-600 mt-2 text-right">{question.length}/255</p>
          </div>

          {/* Options (if needed) */}
          <AnimatePresence>
            {cfg.needsOptions && (
              <motion.div
                key="options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-2xl p-6 border border-white/[0.07] overflow-hidden"
              >
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Answer Options <span className="text-violet-500">({options.filter(Boolean).length})</span>
                </h2>
                <div className="space-y-3">
                  {options.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <input
                        className="input-field flex-1"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => setOption(i, e.target.value)}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="p-2 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
                {options.length < 8 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={addOption}
                    className="mt-4 text-violet-400 hover:text-violet-300"
                  >
                    Add option
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full glow-btn"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Publish Poll
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
