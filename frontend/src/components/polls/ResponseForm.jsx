import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Button from "../ui/Button";
import usePollStore from "../../stores/pollStore";
import toast from "react-hot-toast";

export default function ResponseForm({ poll, onSubmitted }) {
  const { submitResponse, isSubmitting } = usePollStore();
  const [selectedId, setSelectedId] = useState(null); // for single choice: option id
  const [textVal, setTextVal]       = useState("");
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [boolVal, setBoolVal]       = useState(null); // for boolean: true/false

  const handleSubmit = async () => {
    let payload = {};

    if (poll.poll_type === "single" || poll.poll_type === "single_choice") {
      if (selectedId === null) { toast.error("Please select an option"); return; }
      payload = { option_id: selectedId };
    } else if (poll.poll_type === "rating") {
      if (!rating) { toast.error("Please select a rating"); return; }
      payload = { rating };
    } else if (poll.poll_type === "text") {
      if (!textVal.trim()) { toast.error("Please enter your response"); return; }
      payload = { text_response: textVal.trim() };
    } else if (poll.poll_type === "boolean") {
      if (boolVal === null) { toast.error("Please select Yes or No"); return; }
      payload = { boolean_response: boolVal };
    }

    const result = await submitResponse(poll.id, payload);
    if (result.success) {
      toast.success("Response submitted! 🎉");
      onSubmitted?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Single choice */}
      {(poll.poll_type === "single" || poll.poll_type === "single_choice") && (
        <div className="space-y-2.5">
          {poll.options?.map((opt) => {
            const isSelected = String(selectedId) === String(opt.id);
            return (
              <motion.button
                key={opt.id}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedId(opt.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? "bg-violet-500/20 border-violet-500/60 text-violet-200"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-300 hover:border-violet-500/30 hover:bg-violet-500/5"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                    ${isSelected ? "border-violet-400 bg-violet-500" : "border-slate-600"}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm font-medium">{opt.option_text}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Rating */}
      {poll.poll_type === "rating" && (
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="cursor-pointer"
            >
              <Star
                className={`w-9 h-9 transition-colors duration-100 ${
                  (hoverRating || rating) >= star
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-700"
                }`}
              />
            </motion.button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-amber-400 font-medium">{rating}/5</span>
          )}
        </div>
      )}

      {/* Text */}
      {poll.poll_type === "text" && (
        <textarea
          rows={4}
          value={textVal}
          onChange={(e) => setTextVal(e.target.value)}
          placeholder="Share your thoughts…"
          className="input-field resize-none"
        />
      )}

      {/* Boolean */}
      {poll.poll_type === "boolean" && (
        <div className="flex gap-3">
          {[{ val: true, label: "Yes ✓", cls: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15" },
            { val: false, label: "No ✗",  cls: "border-red-500/40 text-red-300 bg-red-500/10 hover:bg-red-500/15"     }].map(({ val, label, cls }) => (
            <motion.button
              key={String(val)}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBoolVal(val)}
              className={`flex-1 py-4 rounded-xl border font-semibold text-base transition-all cursor-pointer
                ${boolVal === val
                  ? cls + " opacity-100 scale-[1.02]"
                  : "border-white/[0.07] text-slate-400 bg-white/[0.03]"}`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        isLoading={isSubmitting}
        onClick={handleSubmit}
      >
        Submit Response
      </Button>
    </div>
  );
}
