import axios from 'axios';
import { supabase } from "../config/connectDB.js";


async function verifyController(handle) {
    try {
        const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        return response.data.status === 'OK' ? response.data.result : [];
    } catch (error) {
        console.error(`Error fetching submissions for ${handle}:`, error);
        return [];
    }
}

export const verifySubmissions = async (req, res) => {
    const { matchId } = req.body;
    console.log("Received matchId:", matchId);

    if (!matchId) {
        return res.status(400).json({ 
            message: 'Match ID is required' 
        });
    }

    try {
        // Get match with joined data using correct column names
        const { data: match, error } = await supabase
            .from('matches')
            .select(`
                id,
                player1:p1(id, cf_handle),
                player2:p2(id, cf_handle),
                problem:cf_question(id, question_id)
            `)
            .eq('id', matchId)
            .single();

        console.log("Complete match data:", match);

        if (error || !match) {
            return res.status(404).json({
                message: 'Match not found',
                error: error
            });
        }

        const handle1 = match.player1?.cf_handle;
        const handle2 = match.player2?.cf_handle;
        const questionId = match.problem?.question_id;

        if (!handle1 || !handle2 || !questionId) {
            return res.status(404).json({
                message: 'Required data not found',
                debug: { handle1, handle2, questionId }
            });
        }

        const [submissions1, submissions2] = await Promise.all([
            verifyController(handle1),
            verifyController(handle2)
        ]);

        const handle1Solved = submissions1.some(sub => 
            sub.problem.contestId + sub.problem.index === questionId && 
            sub.verdict === 'OK'
        );

        const handle2Solved = submissions2.some(sub => 
            sub.problem.contestId + sub.problem.index === questionId && 
            sub.verdict === 'OK'
        );

        if (handle1Solved || handle2Solved) {
            return res.status(400).json({
                message: 'One or both users have already solved this problem'
            });
        }

        return res.status(200).json({
            message: 'Proceed with the contest'
        });

    } catch (error) {
        console.error('Error in verifySubmissions:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export const changeQuestion = async (req, res) => {
    const { matchId } = req.body;

    if (!matchId) {
        return res.status(400).json({
            message: 'Match ID is required'
        });
    }

    try {
        // Get current match details
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('cf_question')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return res.status(404).json({
                message: 'Match not found'
            });
        }

        const oldQuestionId = match.cf_question;

        // Get a new unused question
        const { data: newQuestion, error: questionError } = await supabase
            .from('problemset')
            .select('id')
            .eq('used', false)
            .limit(1)
            .single();

        if (questionError || !newQuestion) {
            return res.status(404).json({
                message: 'No unused questions available'
            });
        }

        // Update match with new question
        const { error: updateError } = await supabase
            .from('matches')
            .update({ cf_question: newQuestion.id })
            .eq('id', matchId);

        if (updateError) {
            throw updateError;
        }

        // Mark old question as unused
        await supabase
            .from('problemset')
            .update({ used: false })
            .eq('id', oldQuestionId);

        // Mark new question as used
        await supabase
            .from('problemset')
            .update({ used: true })
            .eq('id', newQuestion.id);

        return res.status(200).json({
            message: 'Question changed successfully',
            newQuestionId: newQuestion.id
        });

    } catch (error) {
        console.error('Error in changeQuestion:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};


