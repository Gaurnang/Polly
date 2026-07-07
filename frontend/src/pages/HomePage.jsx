import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Search, SlidersHorizontal, Users } from "lucide-react";
import usePollStore from "../stores/pollStore";
import PollCard from "../components/polls/PollCard";
import { Spinner } from "../components/ui/Spinner";
import Input from "../components/ui/Input";
import { POLL_TYPE_META } from "../lib/utils";

const TYPES = ["all", "single", "rating", "text", "boolean"];

export default function HomePage() {
  const { polls, fetchPolls, isLoading } = usePollStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const stats = useMemo(() => {
    const active = polls.filter((p) => p.is_active).length;
    const choice = polls.filter((p) => p.poll_type === "single").length;
    return [
      { label: "Live polls", value: active, icon: Activity, tone: "text-emerald-300" },
      { label: "Choice polls", value: choice, icon: CheckCircle2, tone: "text-violet-300" },
      { label: "Creators", value: new Set(polls.map((p) => p.creator_username).filter(Boolean)).size, icon: Users, tone: "text-cyan-300" },
    ];
  }, [polls]);

  const filtered = polls.filter((p) => {
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      p.question.toLowerCase().includes(query) ||
      p.creator_username?.toLowerCase().includes(query);
    const matchType = filter === "all" || p.poll_type === filter;
    return matchSearch && matchType;
  });

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
          <div className="flex flex-col xl:flex-row gap-3">
            <div className="flex-1">
              <Input
                className="bg-[#0d1018]"
                placeholder="Search polls or creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap
                    ${filter === t
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "border-white/[0.08] text-slate-400 hover:border-violet-500/30 hover:text-slate-200 bg-white/[0.02]"}`}
                >
                  {t === "all" ? "All" : POLL_TYPE_META[t]?.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#11141d] text-center py-16 text-slate-500">
            <p className="text-lg font-medium text-slate-300 mb-1">No polls found</p>
            <p className="text-sm">Try another search or filter.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start">
            {filtered.map((poll, i) => (
              <PollCard key={poll.id} poll={poll} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
