import axios from 'axios';

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
    const { handle1, handle2, questionId } = req.body;

    if (!handle1 || !handle2 || !questionId) {
        return res.status(400).json({ 
            message: 'Missing required parameters' 
        });
    }

    try {
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
            return res.status(403).json({
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


