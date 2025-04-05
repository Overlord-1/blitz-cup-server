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

        // Update the matches table with the winner's ID
        const { error: updateError } = await supabase
            .from('matches')
            .update({ winner: userData.id })
            .eq('id', matchId);

        if (updateError) {
            console.error('Error updating match:', updateError);
            return;
        }

        console.log(`Updated winner for match ${matchId}: ${winnerHandle}`);
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