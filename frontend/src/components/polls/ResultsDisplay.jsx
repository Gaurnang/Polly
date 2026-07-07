import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";

function ChoiceResults({ results }) {
  const choices = Array.isArray(results) ? results : [];

  return (
    <div className="space-y-3">
      {choices.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No responses yet.</p>}
      {choices.map((opt, i) => (
        <motion.div
          key={opt.option_id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">{opt.option_text}</span>
            <span className="text-slate-400">
              {opt.vote_count} <span className="text-slate-600">· {opt.percentage}%</span>
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${opt.percentage}%` }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RatingResults({ results }) {
  if (!results) return null;
  const avg = results.average_rating;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 glass rounded-xl">
        <div className="text-5xl font-bold font-['Outfit'] gradient-text">{avg ?? "—"}</div>
        <div>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
            ))}
          </div>
          <p className="text-sm text-slate-500">Average rating</p>
        </div>
      </div>
      {results.distribution?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Distribution</p>
          {[5,4,3,2,1].map((s) => {
            const row = results.distribution?.find((r) => Number(r.rating) === s);
            const count = row ? Number(row.count) : 0;
            const total = results.distribution?.reduce((a, r) => a + Number(r.count), 0) || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={s} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-slate-400 font-medium">{s}★</span>
                <div className="flex-1 progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.4,0,0.2,1] }}
                  />
                </div>
                <span className="w-8 text-slate-500 text-xs text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BooleanResults({ results }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Yes", count: results.yes, pct: results.yes_percentage, color: "from-emerald-500 to-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        { label: "No",  count: results.no,  pct: results.no_percentage,  color: "from-red-500 to-red-400",         bg: "bg-red-500/10 border-red-500/20" },
      ].map(({ label, count, pct, color, bg }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl border p-5 text-center ${bg}`}
        >
          <div className={`text-4xl font-bold font-['Outfit'] bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {pct}%
          </div>
          <div className="text-sm text-slate-400 mt-1">{label}</div>
          <div className="text-xs text-slate-600 mt-0.5">{count} votes</div>
        </motion.div>
      ))}
    </div>
  );
}

function TextResults({ results }) {
  return (
    <div className="space-y-3">
      {results.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No responses yet.</p>}
      {results.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4"
        >
          <p className="text-slate-200 text-sm mb-2">{r.text_response}</p>
          <p className="text-xs text-slate-600">— @{r.username}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function ResultsDisplay({ data }) {
  if (!data) return null;
  const { poll, results, total_responses } = data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-200">Results</h4>
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          {total_responses} response{total_responses !== 1 ? "s" : ""}
        </span>
      </div>

      {(poll.poll_type === "single" || poll.poll_type === "single_choice") && (
        <ChoiceResults results={results} total={total_responses} />
      )}
      {poll.poll_type === "rating" && <RatingResults results={results} />}
      {poll.poll_type === "boolean" && <BooleanResults results={results} total={total_responses} />}
      {poll.poll_type === "text" && <TextResults results={results} />}
    </div>
  );
}
