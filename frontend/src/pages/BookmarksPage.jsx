import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, ChevronRight, Trash2, Calendar, Lock } from "lucide-react";
import usePollStore from "../stores/pollStore";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { timeAgo } from "../lib/utils";
import toast from "react-hot-toast";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { bookmarks, fetchBookmarks, removeBookmark, isLoading } = usePollStore();

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const handleRemove = async (pollId, e) => {
    e.stopPropagation();
    const r = await removeBookmark(pollId);
    if (r.success) toast.success("Bookmark removed");
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-16 bg-[#090b10]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-2">
            <Bookmark className="w-4 h-4" /> Saved
          </div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white">Bookmarks</h1>
          <p className="text-slate-500 mt-1">Polls you've saved for later</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Tap the bookmark icon on any poll to save it here for quick access."
            action={<Button variant="secondary" onClick={() => navigate("/home")}>Browse polls</Button>}
          />
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b, i) => (
              <motion.div
                key={b.bookmark_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/polls/${b.poll_id}`)}
                className="glass glass-hover rounded-2xl p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge type={b.poll_type} />
                      {!b.is_active && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-500 border border-white/[0.06]">
                          <Lock className="w-3 h-3" /> Closed
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors line-clamp-2 mb-2">
                      {b.question}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>@{b.creator_username}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Saved {timeAgo(b.bookmarked_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleRemove(b.poll_id, e)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
