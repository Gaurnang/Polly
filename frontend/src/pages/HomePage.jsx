import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, SlidersHorizontal, Users, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import usePollStore from "../stores/pollStore";
import PollCard from "../components/polls/PollCard";
import { Spinner } from "../components/ui/Spinner";
import { POLL_TYPE_META } from "../lib/utils";

const TYPES = ["all", "single", "rating", "text", "boolean"];
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Expired" },
];

export default function HomePage() {
  const { polls, fetchPolls, isLoading } = usePollStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filter = searchParams.get("poll_type") || "all";
  const isActiveFilter = searchParams.get("is_active") || "all";
  const page = parseInt(searchParams.get("page"), 10) || 1;
  
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = { page };
    if (filter !== "all") params.poll_type = filter;
    if (isActiveFilter !== "all") params.is_active = isActiveFilter;
    
    // Pass append=false to replace the current polls (classic pagination)
    fetchPolls(params, false).then(({ pagination }) => {
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, isActiveFilter]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    newParams.page = newPage;
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilters = (key, value) => {
    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (value === "all") {
      delete newParams[key];
    } else {
      newParams[key] = value;
    }
    // Reset page to 1 when filters change
    delete newParams.page;
    setSearchParams(newParams);
  };

  const stats = useMemo(() => {
    const active = polls.filter((p) => p.is_active).length;
    const choice = polls.filter((p) => p.poll_type === "single").length;
    return [
      { label: "Live polls", value: active, icon: Activity, tone: "text-emerald-300" },
      { label: "Choice polls", value: choice, icon: CheckCircle2, tone: "text-violet-300" },
      { label: "Creators", value: new Set(polls.map((p) => p.creator_username).filter(Boolean)).size, icon: Users, tone: "text-cyan-300" },
    ];
  }, [polls]);

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-10 bg-[#090b10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-violet-300 mb-2">Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-white">
                Vote and read results in one place
              </h1>
              <p className="text-slate-500 mt-1 max-w-2xl">
                Open a poll card, cast your response, or inspect live results without leaving the feed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className="rounded-xl border border-white/[0.08] bg-[#11141d] px-3 py-3 min-w-0">
                  <div className={`flex items-center gap-1.5 text-xs ${tone}`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                  <p className="text-xl font-bold text-white mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl border border-white/[0.08] bg-[#11141d] p-3 sm:p-4 mb-5"
        >
          <div className="flex flex-col xl:flex-row gap-3 items-center">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 w-full">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateFilters("is_active", s.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap
                    ${isActiveFilter === s.value
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-white/[0.08] text-slate-400 hover:border-blue-500/30 hover:text-slate-200 bg-white/[0.02]"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 w-full xl:w-auto xl:justify-end">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateFilters("poll_type", t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap
                    ${filter === t
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "border-white/[0.08] text-slate-400 hover:border-violet-500/30 hover:text-slate-200 bg-white/[0.02]"}`}
                >
                  {t === "all" ? "All Types" : POLL_TYPE_META[t]?.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : polls.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#11141d] text-center py-16 text-slate-500">
            <p className="text-lg font-medium text-slate-300 mb-1">No polls found</p>
            <p className="text-sm">Try another filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start">
              {polls.map((poll, i) => (
                <PollCard key={`${poll.id}-${i}`} poll={poll} index={i} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 bg-[#11141d] border border-white/[0.08] rounded-xl p-3 max-w-fit mx-auto">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1 || isLoading}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-sm font-medium text-slate-300">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages || isLoading}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
