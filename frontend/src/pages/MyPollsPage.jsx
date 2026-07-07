import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Plus, Trash2, XCircle, ChevronRight, Users, Lock, Unlock } from "lucide-react";
import usePollStore from "../stores/pollStore";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { timeAgo } from "../lib/utils";
import toast from "react-hot-toast";

function MyPollRow({ poll, onDelete, onClose }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass glass-hover rounded-2xl p-5 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex-1 cursor-pointer min-w-0"
          onClick={() => navigate(`/polls/${poll.id}`)}
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge type={poll.poll_type} />
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
              ${poll.is_active
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
              {poll.is_active ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {poll.is_active ? "Active" : "Closed"}
            </span>
          </div>
          <h3 className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors line-clamp-2 mb-3">
            {poll.question}
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{poll.response_count || 0} responses</span>
            <span>{timeAgo(poll.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {poll.is_active && (
            <button
              onClick={() => onClose(poll.id)}
              title="Close poll"
              className="p-2 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(poll.id)}
            title="Delete poll"
            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/polls/${poll.id}`)}
            className="p-2 text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyPollsPage() {
  const navigate = useNavigate();
  const { myPolls, fetchMyPolls, deletePoll, closePoll, isLoading } = usePollStore();

  useEffect(() => { fetchMyPolls(); }, [fetchMyPolls]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this poll permanently?")) return;
    const r = await deletePoll(id);
    if (r.success) toast.success("Poll deleted");
    else toast.error(r.message);
  };

  const handleClose = async (id) => {
    if (!confirm("Close this poll? It will stop accepting responses.")) return;
    const r = await closePoll(id);
    if (r.success) toast.success("Poll closed");
    else toast.error(r.message);
  };

  const active = myPolls.filter((p) => p.is_active);
  const closed = myPolls.filter((p) => !p.is_active);

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-16 bg-[#090b10]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-2">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </div>
            <h1 className="text-3xl font-bold font-['Outfit'] text-white">My Polls</h1>
            <p className="text-slate-500 mt-1">{myPolls.length} poll{myPolls.length !== 1 ? "s" : ""} created</p>
          </div>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate("/create")}
            className="glow-btn"
          >
            New Poll
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : myPolls.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No polls yet"
            description="Create your first poll and start collecting responses from the community."
            action={
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate("/create")}>
                Create your first poll
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <section>
                <h2 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                  Active ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((p) => (
                    <MyPollRow key={p.id} poll={p} onDelete={handleDelete} onClose={handleClose} />
                  ))}
                </div>
              </section>
            )}
            {closed.length > 0 && (
              <section>
                <h2 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                  Closed ({closed.length})
                </h2>
                <div className="space-y-3 opacity-70">
                  {closed.map((p) => (
                    <MyPollRow key={p.id} poll={p} onDelete={handleDelete} onClose={handleClose} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
