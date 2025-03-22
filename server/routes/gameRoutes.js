import express from 'express';
const router = express.Router();
import { getMatch, initializeTournament } from '../controllers/gameController.js';

router.post('/get-match', getMatch);
router.get('/initialize-tournament', initializeTournament);

export default router;