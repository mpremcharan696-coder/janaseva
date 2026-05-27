import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { query } from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For production, you may want to restrict this to your Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint for deployment platforms
app.get('/health', async (req, res) => {
  try {
    const dbTest = await query('SELECT NOW()');
    res.status(200).json({ 
      status: 'ok', 
      message: 'JanaSeva API is running', 
      database: 'connected',
      dbTime: dbTest.rows[0].now
    });
  } catch (err: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'JanaSeva API is running, but database connection failed', 
      error: err.message,
      stack: err.stack,
      dbUrlExists: !!process.env.DATABASE_URL
    });
  }
});

// Catch-all for unmatched API routes — returns JSON instead of Vercel's default HTML
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Serve frontend static files in production (Render)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(distPath));
  // All non-API routes → serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start the server if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
