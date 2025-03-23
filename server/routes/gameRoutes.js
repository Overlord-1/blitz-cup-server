import express from 'express';
const router = express.Router();
import { startgame, getMatches, getParticipants, reset} from '../controllers/gameController.js';

router.post('/start-game', startgame);
router.get('/get-matches', getMatches);
router.get('/get-participants', getParticipants);
router.get('/reset-game', reset);

export default router;