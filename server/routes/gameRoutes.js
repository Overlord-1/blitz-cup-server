import express from 'express';
const router = express.Router();
import { startgame, getMatches, getParticipants} from '../controllers/gameController.js';

router.post('/start-game', startgame);
router.get('/get-matches', getMatches);
router.get('/get-participants', getParticipants);

export default router;