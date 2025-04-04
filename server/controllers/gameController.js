import { supabase } from "../config/connectDB.js";

export const startgame = async (req, res) => {
  try {
    const { round } = req.body;

    if (!round || typeof round !== "number" || round < 1) {
      return res.status(400).json({ error: "Invalid round parameter" });
    }

    // First, insert the tournament structure
    const { error: structureError } = await supabase.rpc('initialize_tournament_structure');
    
    if (structureError) {
      throw structureError;
    }

    // Get all eligible players
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("cf_handle, id")
      .eq("max_round", round - 1)
      .limit(32);

    if (userError) throw userError;
    if (!users?.length >= 32) {
      return res.status(404).json({ error: "Not enough users found for this round" });
    }

    // Get unused questions
    const { data: questions, error: questionError } = await supabase
      .from("problemset")
      .select("*")
      .eq("used", false)
      .limit(16);

    if (questionError) throw questionError;
    if (!questions?.length || questions.length < 16) {
      return res.status(404).json({ error: "Not enough unused questions available" });
    }

    const shuffledUsers = users.sort(() => Math.random() - 0.5);
    
    // Get round 1 matches
    const { data: roundMatches, error: matchError } = await supabase
      .from("matches")
      .select("*")  // Changed from just "id" to "*"
      .eq("level", 1)
      .order('match_number', { ascending: true });

    if (matchError) throw matchError;
    if (!roundMatches?.length) {
      throw new Error("No matches found for round 1");
    }

    // Update matches with players and questions
    const updates = roundMatches.slice(0, 16).map((match, i) => ({  // Limit to first 16 matches
      id: match.id,
      p1: shuffledUsers[i * 2]?.id,
      p2: shuffledUsers[i * 2 + 1]?.id,
      cf_question: questions[i]?.id,
      title: questions[i]?.link,
      match_number: match.match_number
    }));

    // Update matches in batch
    const { error: updateError } = await supabase
      .from("matches")
      .upsert(updates);

    if (updateError) throw updateError;

    // Update players max_round
    const playerIds = shuffledUsers.slice(0, 32).map(user => user.id);
    const { error: playerUpdateError } = await supabase
      .from("users")
      .update({ max_round: round })
      .in("id", playerIds);

    if (playerUpdateError) throw playerUpdateError;

    // Mark questions as used
    const questionIds = questions.slice(0, 16).map(q => q.id);
    const { error: usedError } = await supabase
      .from("problemset")
      .update({ used: true })
      .in("id", questionIds);

    if (usedError) throw usedError;

    res.status(200).send({ message: "Successfully initialized tournament" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMatches = async (req, res) => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .neq('match_number', -1)
      .order('match_number', { ascending: true });

    if (error) throw error;

    // Return array directly instead of converting to object
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getParticipants = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, cf_handle')
      .order('id');

    if (error) throw error;

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

export const reset = async (req, res) => {
  try {
    // Delete all matches
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .neq('match_number', -1);

    if (matchError) throw matchError;

    // Reset all users max_round
    const { error: userError } = await supabase
      .from('users')
      .update({ max_round: 0 })
      .eq('max_round', 1);

    if (userError) throw userError;

    // Reset all questions to unused
    const { error: questionError } = await supabase
      .from('problemset')
      .update({ used: false })
      .eq('used', true);

    if (questionError) throw questionError;

    res.status(200).json({ message: 'Game reset successfully' });
  } catch (error) {
    console.error('Error resetting game:', error);
    res.status(500).json({ error: 'Failed to reset game' });
  }
}