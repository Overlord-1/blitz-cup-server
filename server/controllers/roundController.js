import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Controller to start tracking a Blitz tournament match
export const startTrackingMatch = async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    // 1. Query the match table to get player IDs and problem
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, p1, p2, cf_question')
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // 2. Query the users table to get handles
    const { data: player1, error: p1Error } = await supabase
      .from('users')
      .select('cf_handle')
      .eq('id', match.p1)
      .single();
      
    const { data: player2, error: p2Error } = await supabase
      .from('users')
      .select('cf_handle')
      .eq('id', match.p2)
      .single();
    
    if (p1Error || p2Error || !player1 || !player2) {
      return res.status(404).json({ error: 'One or both players not found' });
    }
    
    // 3. Query the problemset table to get the question_id
    const { data: problem, error: problemError } = await supabase
      .from('problemset')
      .select('question_id')
      .eq('id', match.cf_question)
      .single();
    
    if (problemError || !problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // 4. Format the problem_id (add slash before the letter)
    let formattedProblemId = problem.question_id;
    const letterIndex = problem.question_id.search(/[A-Za-z]/);
    
    if (letterIndex !== -1) {
      formattedProblemId = 
        problem.question_id.substring(0, letterIndex) + 
        '/' + 
        problem.question_id.substring(letterIndex);
    }
    console.log({
        handle1: player1.cf_handle,
        handle2: player2.cf_handle,
        problem_id: formattedProblemId,
        match_id: matchId
    });
    
    // 5. Call the worker to start tracking
    const workerResponse = await axios.post(`${process.env.WORKER_URL}/start_tracking`, {
      handle1: player1.cf_handle,
      handle2: player2.cf_handle,
      problem_id: formattedProblemId,
      match_id: matchId
    });
    
    return res.status(200).json({ 
      message: 'Tracking started successfully',
      data: workerResponse.data
    });
    
  } catch (error) {
    console.error('Error starting tracking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};