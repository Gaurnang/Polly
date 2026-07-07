import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Star,
} from "lucide-react";
import Badge from "../ui/Badge";
import { timeAgo } from "../../lib/utils";
import usePollStore from "../../stores/pollStore";
import useAuthStore from "../../stores/authStore";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ResultsDisplay from "./ResultsDisplay";

const normalizeType = (type) => {
  if (type === "single_choice" || type === "multiple_choice" || type === "multiple") return "single";
  return type;
};

export default function PollCard({ poll: initialPoll, index = 0 }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isBookmarked, addBookmark, removeBookmark, submitResponse } = usePollStore();

  const [expanded, setExpanded] = useState(false);
  const [fullPoll, setFullPoll] = useState(null);
  const [loadingPoll, setLoadingPoll] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [textVal, setTextVal] = useState("");
  const [boolVal, setBoolVal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(Boolean(initialPoll.has_voted));
  const [responseCount, setResponseCount] = useState(Number(initialPoll.response_count ?? 0));
  const [resultsOpen, setResultsOpen] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);

  const poll = fullPoll ?? initialPoll;
  const pollType = normalizeType(poll.poll_type);
  const bookmarked = isBookmarked(initialPoll.id);
  const isActive = poll.is_active;

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Login to bookmark polls");
      navigate("/login");
      return;
    }

    if (bookmarked) {
      const r = await removeBookmark(poll.id);
      if (r.success) toast.success("Bookmark removed");
    } else {
      const r = await addBookmark(poll.id);
      if (r.success) toast.success("Bookmarked");
      else toast.error(r.message);
    }
  };

  const ensureFullPoll = async () => {
    if (fullPoll) return fullPoll;
    setLoadingPoll(true);
    try {
      const { data } = await api.get(`/polls/${poll.id}`);
      const loadedPoll = {
        ...data.data.poll,
        poll_type: normalizeType(data.data.poll.poll_type),
      };
      setVoted(Boolean(loadedPoll.has_voted));
      setResponseCount(Number(loadedPoll.response_count ?? 0));
      setFullPoll(loadedPoll);
      return loadedPoll;
    } catch {
      toast.error("Failed to load poll");
      return null;
    } finally {
      setLoadingPoll(false);
    }
  };

  const handleToggleVote = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Login to vote");
      navigate("/login");
      return;
    }
    if (!isActive) {
      toast.error("This poll is closed");
      return;
    }
    if (voted) {
      return;
    }
    if (expanded) {
      setExpanded(false);
      return;
    }

    const loadedPoll = await ensureFullPoll();
    if (loadedPoll?.has_voted) return;
    if (loadedPoll) setExpanded(true);
  };

  const handleResults = async (e, forceOpen = false) => {
    e?.stopPropagation();
    if (resultsOpen && !forceOpen) {
      setResultsOpen(false);
      return;
    }

    setLoadingResults(true);
    try {
      const { data } = await api.get(`/polls/${poll.id}/results`);
      setResultsData(data.data);
      setResultsOpen(true);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    const p = fullPoll ?? poll;
    const currentType = normalizeType(p.poll_type);
    let payload = {};

    if (currentType === "single") {
      if (selectedId === null) {
        toast.error("Please select an option");
        return;
      }
      payload = { option_id: selectedId };
    } else if (currentType === "rating") {
      if (!rating) {
        toast.error("Please select a rating");
        return;
      }
      payload = { rating };
    } else if (currentType === "text") {
      if (!textVal.trim()) {
        toast.error("Please type a response");
        return;
      }
      payload = { text_response: textVal.trim() };
    } else if (currentType === "boolean") {
      if (boolVal === null) {
        toast.error("Please select Yes or No");
        return;
      }
      payload = { boolean_response: boolVal };
    }

    setSubmitting(true);
    const result = await submitResponse(p.id, payload);
    setSubmitting(false);

    if (result.success) {
      toast.success("Response submitted");
      setVoted(true);
      setResponseCount((count) => count + 1);
      setExpanded(false);
      await handleResults(e, true);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="bg-[#11141d] rounded-xl overflow-hidden border border-white/[0.08] hover:border-violet-500/25 transition-colors"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge type={pollType} />
            {!isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <Lock className="w-3 h-3" /> Closed
              </span>
            )}
            {voted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Voted
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-label="Open poll details"
              onClick={() => navigate(`/polls/${poll.id}`)}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-200"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark poll"}
              onClick={handleBookmark}
              className="shrink-0 p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors text-slate-500 hover:text-violet-400"
            >
              {bookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-violet-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <h3 className="text-slate-100 font-semibold text-base mb-4 line-clamp-2">
          {poll.question}
        </h3>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 min-w-0">
            <span className="w-5 h-5 rounded-md bg-violet-600/50 flex items-center justify-center text-[10px] font-bold text-violet-100 shrink-0">
              {poll.creator_username?.[0]?.toUpperCase() || "U"}
            </span>
            <span className="truncate">{poll.creator_username}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3" />
            {timeAgo(poll.created_at)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <BarChart3 className="w-3 h-3 text-cyan-400" />
          <span>{responseCount} response{responseCount === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="px-5 pb-4 grid grid-cols-2 gap-2">
        {!voted && isActive ? (
          <button
            onClick={handleToggleVote}
            disabled={loadingPoll}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2
              ${expanded
                ? "bg-violet-600/20 border-violet-500/50 text-violet-200"
                : "bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50"}`}
          >
            {loadingPoll ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {expanded ? "Collapse" : "Vote"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={`w-full py-2.5 rounded-lg text-sm font-semibold border cursor-not-allowed
              ${voted
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-slate-800/70 border-white/[0.08] text-slate-500"}`}
          >
            {voted ? "Voted" : "Closed"}
          </button>
        )}

        <button
          type="button"
          disabled={loadingResults}
          onClick={handleResults}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2
            ${resultsOpen
              ? "bg-cyan-500/12 border-cyan-500/35 text-cyan-200"
              : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:border-cyan-500/30 hover:text-cyan-200"}`}
        >
          {loadingResults ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          Results
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="vote-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="px-5 py-4 space-y-3 bg-[#0d1018]">
              {pollType === "single" && (
                <div className="space-y-2">
                  {(fullPoll?.options ?? []).map((opt) => {
                    const isSelected = String(selectedId) === String(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedId(opt.id)}
                        className={`w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-all cursor-pointer
                          ${isSelected
                            ? "bg-violet-500/20 border-violet-500/60 text-violet-100"
                            : "bg-white/[0.03] border-white/[0.07] text-slate-300 hover:border-violet-500/30"}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-violet-400 bg-violet-500" : "border-slate-600"}`}>
                            {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </span>
                          <span className="font-medium">{opt.option_text}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {pollType === "rating" && (
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer p-0.5"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          (hoverRating || rating) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && <span className="ml-2 text-sm text-amber-400 font-semibold">{rating}/5</span>}
                </div>
              )}

              {pollType === "text" && (
                <textarea
                  rows={3}
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="input-field resize-none text-sm"
                />
              )}

              {pollType === "boolean" && (
                <div className="flex gap-2">
                  {[
                    { val: true, label: "Yes", activeClass: "border-emerald-500/50 text-emerald-300 bg-emerald-500/15" },
                    { val: false, label: "No", activeClass: "border-red-500/50 text-red-300 bg-red-500/15" },
                  ].map(({ val, label, activeClass }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setBoolVal(val)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer
                        ${boolVal === val
                          ? activeClass
                          : "border-white/[0.07] text-slate-400 bg-white/[0.03] hover:border-violet-500/30"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? "Submitting" : "Submit Response"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resultsOpen && resultsData && (
          <motion.div
            key="results-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-5 bg-[#0d1018]">
              <ResultsDisplay data={resultsData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
