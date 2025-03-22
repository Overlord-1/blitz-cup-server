import { supabase } from "../config/connectDB.js";

export const getMatch = async (req, res) => {
  try {
    const { round } = req.body;

    if (!round || typeof round !== "number" || round < 1) {
      return res.status(400).json({ error: "Invalid round parameter" });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("cf_handle, id")
      .eq("max_round", round - 1)
      .limit(10);

    if (error) throw error;
    if (!users?.length >= 2) {
      return res
        .status(404)
        .json({ error: "Not enough users found for this round" });
    }

    const shuffled = users.sort(() => Math.random() - 0.5);
    const player1 = {
      id: shuffled[0].id,
      cf_handle: shuffled[0].cf_handle,
    };

    const player2 = {
      id: shuffled[1].id,
      cf_handle: shuffled[1].cf_handle,
    };

    res.status(200).send({ player1, player2 });

    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Begin-Tournament
export const initializeTournament = async (req, res) => {
  try {
    // Get all users that are eligible for the tournament
    const { data: users, error } = await supabase
      .from('users')
      .select('id, cf_handle')
      .eq("max_round", 0)
      .limit(32);

    if (error) throw error;

    if (!users || users.length < 32) {
      return res.status(400).json({ 
        error: 'Not enough participants available for the tournament' 
      });
    }

    // Shuffle the array of users randomly
    const shuffledParticipants = users
      .slice(0, 32)
      .sort(() => Math.random() - 0.5);

    res.status(200).json({
      participants: shuffledParticipants,
      message: 'Tournament initialized successfully'
    });

  } catch (error) {
    console.error('Error initializing tournament:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};