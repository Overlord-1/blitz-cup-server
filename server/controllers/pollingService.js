import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function updateMatchWinner(matchId, winnerHandle) {
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
            .select('match_number')
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

        // Get the next match details to check player slots
        const { data: nextMatchData, error: nextMatchCheckError } = await supabase
            .from('matches')
            .select('p1, p2')
            .eq('match_number', nextMatchNumber)
            .single();

        if (nextMatchCheckError) {
            console.error('Error checking next match:', nextMatchCheckError);
            return;
        }

        // Determine which player slot to update
        const updateField = !nextMatchData.p1 ? 'p1' : 'p2';

        // Update the next match with the winner as a player
        const { error: nextMatchError } = await supabase
            .from('matches')
            .update({ 
                [updateField]: userData.id 
            })
            .eq('match_number', nextMatchNumber);

        if (nextMatchError) {
            console.error('Error updating next match:', nextMatchError);
            return;
        }

        console.log(`Updated winner for match ${matchId}: ${winnerHandle}`);
        console.log(`Updated next match ${nextMatchNumber} with winner as ${updateField}`);
    } catch (error) {
        console.error('Error in updateMatchWinner:', error);
    }
}

async function pollWinners() {
    try {
        const response = await fetch('http://127.0.0.1:5000/winners');
        const data = await response.json();
        if (data.status === 'success' && data.winners && data.winners.length > 0) {
            for (const match of data.winners) {
                await updateMatchWinner(match.match_id, match.winner);
            }
        }
    } catch (error) {
        console.error('Error polling winners:', error);
    }
}

// Start polling
function startPolling(interval = 20000) {
    console.log('Started polling for winners...');
    setInterval(pollWinners, interval);
}

export { startPolling };