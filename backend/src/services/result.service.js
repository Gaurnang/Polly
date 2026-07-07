import { findPollById } from "../repository/poll.repository.js";
import {
  findChoiceResults,
  findRatingResults,
  findTextResults,
  findBooleanResults,
  findTotalResponses,
} from "../repository/result.repository.js";

export const getPollResults = async (poll_id) => {
  const poll = await findPollById(poll_id);
  if (!poll) {
    throw { status: 404, message: "Poll not found." };
  }

  const totalResponses = await findTotalResponses(poll_id);

  let results;

  switch (poll.poll_type) {
    case "single":
    case "single_choice":
    case "multiple": {
      const rows = await findChoiceResults(poll_id);
      results = rows.map((row) => ({
        option_id:   row.option_id,
        option_text: row.option_text,
        vote_count:  parseInt(row.vote_count, 10),
        percentage:
          totalResponses > 0
            ? parseFloat(
                ((parseInt(row.vote_count, 10) / totalResponses) * 100).toFixed(1)
              )
            : 0,
      }));
      break;
    }

    case "rating": {
      const rows = await findRatingResults(poll_id);
      const distribution = rows.map((r) => ({
        rating: parseInt(r.rating, 10),
        count:  parseInt(r.count, 10),
      }));
      results = {
        average_rating:
          rows.length > 0 ? parseFloat(rows[0].average_rating) : null,
        distribution,
      };
      break;
    }

    case "text": {
      results = await findTextResults(poll_id);
      break;
    }

    case "boolean": {
      const rows = await findBooleanResults(poll_id);
      const yes = rows.find((r) => r.boolean_response === true);
      const no  = rows.find((r) => r.boolean_response === false);
      results = {
        yes: parseInt(yes?.count ?? 0, 10),
        no:  parseInt(no?.count ?? 0, 10),
        yes_percentage:
          totalResponses > 0
            ? parseFloat(
                (
                  (parseInt(yes?.count ?? 0, 10) / totalResponses) *
                  100
                ).toFixed(1)
              )
            : 0,
        no_percentage:
          totalResponses > 0
            ? parseFloat(
                (
                  (parseInt(no?.count ?? 0, 10) / totalResponses) *
                  100
                ).toFixed(1)
              )
            : 0,
      };
      break;
    }

    default:
      results = null;
  }

  return {
    poll: {
      id:          poll.id,
      question:    poll.question,
      poll_type:   poll.poll_type,
      is_active:   poll.is_active,
      created_at:  poll.created_at,
    },
    total_responses: totalResponses,
    results,
  };
};
