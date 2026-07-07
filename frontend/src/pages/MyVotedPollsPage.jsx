import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usePollStore from "../stores/pollStore";
import PollCard from "../components/polls/PollCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";

export default function MyVotedPollsPage() {
  const navigate = useNavigate();
  const { myVotedPolls, fetchMyVotedPolls, isLoading } = usePollStore();

  useEffect(() => {
    fetchMyVotedPolls();
  }, [fetchMyVotedPolls]);

  return (
    <div className="min-h-screen pt-20 md:pt-0 pb-16 bg-[#090b10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-2">
            <CheckCircle2 className="w-4 h-4" /> My Activity
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-white">
            My Voted Polls
          </h1>
          <p className="text-slate-500 mt-1">
            Polls you have already responded to, with results available from each card.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : myVotedPolls.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No voted polls yet"
            description="Vote on polls from the dashboard and they will appear here."
            action={
              <Button
                variant="secondary"
                leftIcon={<Home className="w-4 h-4" />}
                onClick={() => navigate("/home")}
              >
                Go to dashboard
              </Button>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start">
            {myVotedPolls.map((poll, i) => (
              <PollCard key={poll.id} poll={{ ...poll, has_voted: true }} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
