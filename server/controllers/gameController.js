import { supabase } from "../config/connectDB.js";

export const getMatch = async (req, res) => {
  try {
    const { round } = req.body;

    if (!round || typeof round !== "number" || round < 1) {
      return res.status(400).json({ error: "Invalid round parameter" });
    }
    // Get all eligible players
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("cf_handle, id")
      .eq("max_round", round - 1)
      .limit(32);  // Get enough users for 16 matches

    if (userError) {
      return res.status(401).json({ error: "Only allowed for the first round" });
    }
    if (!users?.length >= 32) {
      return res
        .status(404)
        .json({ error: "Not enough users found for this round" });
    }

    // Get unused questions
    const { data: questions, error: questionError } = await supabase
      .from("problemset")
      .select("*")
      .eq("used", false)
      .limit(16);

    if (questionError) throw questionError;
    if (!questions?.length || questions.length < 16) {
      return res
        .status(404)
        .json({ error: "Not enough unused questions available" });
    }

    const shuffledUsers = users.sort(() => Math.random() - 0.5);
    const matches = [];

    for (let i = 0; i < 16; i++) {
      if (!shuffledUsers[i * 2]?.id || !shuffledUsers[i * 2 + 1]?.id || !questions[i]?.id) {
        return res.status(400).json({ error: "Invalid user or question data" });
      }

      const match = {
        level: round,
        p1: shuffledUsers[i * 2].id,
        p2: shuffledUsers[i * 2 + 1].id,
        cf_question: questions[i].id,
        title: questions[i].link
      };
      matches.push(match);
    }

    // Insert matches
    const { error: matchError } = await supabase
      .from("matches")
      .insert(matches);

    if (matchError) throw matchError;

    // Update players max_round
    const playerIds = shuffledUsers.slice(0, 32).map(user => user.id);
    const { error: updateError } = await supabase
      .from("users")
      .update({ max_round: round })
      .in("id", playerIds);

    if (updateError) throw updateError;

    // Mark questions as used
    const questionIds = questions.slice(0, 16).map(q => q.id);
    const { error: usedError } = await supabase
      .from("problemset")
      .update({ used: true })
      .in("id", questionIds);

    if (usedError) throw usedError;

    res.status(200).send({ message: "Successfully created matches", matches });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



