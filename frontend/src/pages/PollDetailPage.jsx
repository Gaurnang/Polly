import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Lock, Unlock, Share2,
  CheckCircle, BarChart3, Trash2, XCircle
} from "lucide-react";
import usePollStore from "../stores/pollStore";
import useAuthStore from "../stores/authStore";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ResponseForm from "../components/polls/ResponseForm";
import ResultsDisplay from "../components/polls/ResultsDisplay";
import { Spinner } from "../components/ui/Spinner";
import { timeAgo } from "../lib/utils";
import toast from "react-hot-toast";

export default function PollDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    fetchPollById, currentPoll, isLoading,
    fetchResults, currentResults, clearResults,
    deletePoll, closePoll,
  } = usePollStore();

  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchPollById(id);
    clearResults();
    setHasVoted(false);
    setShowResults(false);
  }, [id, fetchPollById, clearResults]);

  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    await fetchResults(id);
    setLoadingResults(false);
    setShowResults(true);
  }, [id, fetchResults]);

  const handleVoted = async () => {
    setHasVoted(true);
    await loadResults();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this poll? This cannot be undone.")) return;
    const r = await deletePoll(id);
    if (r.success) { toast.success("Poll deleted"); navigate("/my-polls"); }
    else toast.error(r.message);
  };

  const handleClose = async () => {
    if (!confirm("Close this poll? It will stop accepting responses.")) return;
    const r = await closePoll(id);
    if (r.success) toast.success("Poll closed");
    else toast.error(r.message);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 md:pt-0 bg-[#090b10]">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!currentPoll) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 md:pt-0 gap-4 bg-[#090b10]">
        <p className="text-slate-400">Poll not found</p>
        <Button variant="secondary" onClick={() => navigate("/home")}>Go home</Button>
      </div>
    );
  }

  const poll = currentPoll;
  const isOwner = isAuthenticated && String(user?.id) === String(poll.creator_id);
  const isActive = poll.is_active;
  const canSeeResults = hasVoted || !isActive || isOwner;

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-16 bg-[#090b10]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-white/[0.07]"
        >
          {/* Meta */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <Badge type={poll.poll_type} />
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"}`}
              >
                {isActive ? <><Unlock className="w-3 h-3" /> Active</> : <><Lock className="w-3 h-3" /> Closed</>}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Question */}
          <h1 className="text-2xl font-bold font-['Outfit'] text-white mb-4 leading-snug">
            {poll.question}
          </h1>

          {/* Author / date */}
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-violet-600/60 flex items-center justify-center text-xs font-bold text-white">
                {poll.creator_username?.[0]?.toUpperCase()}
              </div>
              @{poll.creator_username}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {timeAgo(poll.created_at)}
            </span>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="flex gap-2 mb-6">
              {isActive && (
                <Button variant="secondary" size="sm" leftIcon={<XCircle className="w-4 h-4" />} onClick={handleClose}>
                  Close Poll
                </Button>
              )}
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BarChart3 className="w-4 h-4" />}
                onClick={loadResults}
              >
                View Results
              </Button>
            </div>
          )}

          {/* Response form */}
          <AnimatePresence mode="wait">
            {!hasVoted && isActive && !isOwner && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isAuthenticated ? (
                  <div>
                    <h2 className="text-base font-semibold text-slate-200 mb-4">Cast your vote</h2>
                    <ResponseForm poll={poll} onSubmitted={handleVoted} />
                  </div>
                ) : (
                  <div className="text-center py-6 glass rounded-2xl">
                    <p className="text-slate-400 mb-4">Log in to participate in this poll</p>
                    <Button onClick={() => navigate("/login")}>Sign in to vote</Button>
                  </div>
                )}
              </motion.div>
            )}

            {hasVoted && (
              <motion.div key="voted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle className="w-4 h-4" /> Response submitted successfully!
                </div>
              </motion.div>
            )}

            {!isActive && !isOwner && (
              <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 text-slate-500 text-sm p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6">
                  <Lock className="w-4 h-4" /> This poll is closed — no more responses.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {(canSeeResults && !showResults) && (
            <Button
              variant="outline"
              className="w-full mt-4"
              isLoading={loadingResults}
              onClick={loadResults}
              leftIcon={<BarChart3 className="w-4 h-4" />}
            >
              {loadingResults ? "Loading…" : "See results"}
            </Button>
          )}

          {showResults && currentResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-white/[0.06]"
            >
              <ResultsDisplay data={currentResults} />
            </motion.div>
          )}

          {loadingResults && !showResults && (
            <div className="flex justify-center py-8"><Spinner /></div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
