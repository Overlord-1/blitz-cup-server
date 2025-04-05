import express from 'express';
import { startTrackingMatch,getProblemLink } from '../controllers/roundController.js'

const roundRouter = express.Router();

roundRouter.post('/start-game', startTrackingMatch);
roundRouter.post('/get-question',getProblemLink)

export default roundRouter;