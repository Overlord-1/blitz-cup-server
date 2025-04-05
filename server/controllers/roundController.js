import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const startTrackingMatch = async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, p1, p2, cf_question')
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
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
    
    const { data: problem, error: problemError } = await supabase
      .from('problemset')
      .select('question_id')
      .eq('id', match.cf_question)
      .single();
    
    if (problemError || !problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
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

export const getProblemLink = async (req, res) => {
  try {
    const { matchId } = req.body;
    console.log(matchId);
    
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, cf_question')
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Check if cf_question is NULL
    if (!match.cf_question) {
      return res.status(200).json({ 
        message: 'Match not started',
        problemLink: null
      });
    }
    
    // Get problem details
    const { data: problem, error: problemError } = await supabase
      .from('problemset')
      .select('question_id')
      .eq('id', match.cf_question)
      .single();
    
    if (problemError || !problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Format problem ID for the URL
    let formattedProblemId = problem.question_id;
    const letterIndex = problem.question_id.search(/[A-Za-z]/);
    
    // Create the problem link following Codeforces format
    let problemLink;
    if (letterIndex !== -1) {
      const contestNumber = problem.question_id.substring(0, letterIndex);
      const problemLetter = problem.question_id.substring(letterIndex);
      problemLink = `https://codeforces.com/problemset/problem/${contestNumber}/${problemLetter}`;
    } else {
      // Handle case where question_id doesn't have the expected format
      problemLink = `https://codeforces.com/problemset/problem/${problem.question_id}`;
    }
    
    return res.status(200).json({ 
      message: 'Problem link retrieved successfully',
      problemLink
    });
    
  } catch (error) {
    console.error('Error getting problem link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};