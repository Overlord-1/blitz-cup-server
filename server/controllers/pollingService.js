import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Add a Set to keep track of processed match IDs
const processedMatches = new Set();

async function getRandomQuestion(level) {
    try {
        // Get a random unused question matching the level/band
        const { data: questionData, error: questionError } = await supabase
            .from('problemset')
            .select('id')
            .eq('band', level)
            .eq('used', false)
            .limit(1)
            .single();

        if (questionError) {
            console.error('Error fetching question:', questionError);
            return null;
        }

        if (!questionData) {
            console.error(`No unused questions found for level ${level}`);
            return null;
        }

        // Mark the question as used
        const { error: updateError } = await supabase
            .from('problemset')
            .update({ used: true })
            .eq('id', questionData.id);

        if (updateError) {
            console.error('Error marking question as used:', updateError);
            return null;
        }

        return questionData.id;
    } catch (error) {
        console.error('Error in getRandomQuestion:', error);
        return null;
    }
}

async function updateMatchWinner(matchId, winnerHandle) {
    // Skip if this match was already processed
    if (processedMatches.has(matchId)) {
        console.log(`Match ${matchId} already processed, skipping...`);
        return;
    }

    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('cf_handle', winnerHandle)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            return;
        }

        if (!userData) {
            console.error(`User ${winnerHandle} not found`);
            return;
        }

        // Get the current match details
        const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .select('match_number, level')
            .eq('id', matchId)
            .single();

        if (matchError) {
            console.error('Error fetching match:', matchError);
            return;
        }

        // Update the current match with the winner
        const { error: updateError } = await supabase
            .from('matches')
            .update({ winner: userData.id })
            .eq('id', matchId);

        if (updateError) {
            console.error('Error updating match:', updateError);
            return;
        }

        // Calculate next match number (integer division by 2)
        const nextMatchNumber = Math.floor(matchData.match_number / 2);

        // Get the next match details to check player slots and level
        const { data: nextMatchData, error: nextMatchCheckError } = await supabase
            .from('matches')
            .select('p1, p2, level')
            .eq('match_number', nextMatchNumber)
            .single();

        if (nextMatchCheckError) {
            console.error('Error checking next match:', nextMatchCheckError);
            return;
        }

        // Get a random question for the next match using the next match's level
        const questionId = await getRandomQuestion(nextMatchData.level);

        // Determine which player slot to update
        const updateField = !nextMatchData.p1 ? 'p1' : 'p2';

        // Update the next match with the winner as a player and the question
        const { error: nextMatchError } = await supabase
            .from('matches')
            .update({ 
                [updateField]: userData.id,
                cf_question: questionId
            })
            .eq('match_number', nextMatchNumber);

        if (nextMatchError) {
            console.error('Error updating next match:', nextMatchError);
            return;
        }

        console.log(`Updated winner for match ${matchId}: ${winnerHandle}`);
        console.log(`Updated next match ${nextMatchNumber} with winner as ${updateField} and question ${questionId}`);

        // Add the match to processed set after successful update
        processedMatches.add(matchId);
        
    } catch (error) {
        console.error('Error in updateMatchWinner:', error);
    }
}

async function pollWinners() {
    try {
        const response = await fetch(`${process.env.WORKER_URL}/winners`);
        const data = await response.json();
        if (data.status === 'success' && data.winners && data.winners.length > 0) {
            // Filter out already processed matches
            const newWinners = data.winners.filter(match => !processedMatches.has(match.match_id));
            
            for (const match of newWinners) {
                await updateMatchWinner(match.match_id, match.winner);
            }
        }
    } catch (error) {
        console.error('Error polling winners:', error);
    }
}

// Start polling
function startPolling(interval = 2000) {
    console.log('Started polling for winners...');
    setInterval(pollWinners, interval);
}

export { startPolling };