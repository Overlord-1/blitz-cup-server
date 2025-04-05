import express from 'express';
import { changeQuestion, verifySubmissions } from '../controllers/verifyController.js';
const router = express.Router();

router.post('/verify', verifySubmissions);
router.post('/change', changeQuestion );


export default router;