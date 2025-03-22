import express from 'express';
const router = express.Router();
import { getMatch } from '../controllers/gameController.js';

router.post('/get-match', getMatch);

export default router;