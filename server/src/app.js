import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/rooms', roomRoutes);

export default app;
