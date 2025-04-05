import express from 'express';
import { startTrackingMatch } from '../controllers/roundController.js'

const roundRouter = express.Router();

roundRouter.post('/start-game', startTrackingMatch);

export default roundRouter;