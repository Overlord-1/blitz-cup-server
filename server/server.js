import express from 'express';
import dotenv from 'dotenv';
import gameRoutes from './routes/gameRoutes.js';
import cors from 'cors';
import morgan from 'morgan';
import questionRoutes from './routes/questionRoutes.js';
import roundRouter from './routes/roundRoutes.js';
// import { startPolling } from './controllers/pollingService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/question',questionRoutes);
app.use('/game', gameRoutes);
app.use('/round',roundRouter);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.use('/', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // startPolling();
});
