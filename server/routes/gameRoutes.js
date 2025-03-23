import express from 'express';
const router = express.Router();
import { getMatch } from '../controllers/gameController.js';

router.post('/start-game', getMatch);
// router.get('/initialize-tournament', initializeTournament);

export default router;