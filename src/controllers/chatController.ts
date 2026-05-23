import { Request, Response } from 'express';
import { query } from '../lib/db.js';

export async function getHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const result = await query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp ASC',
      [userId]
    );

    res.json({ messages: result.rows });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export async function saveMessage(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { role, content, language } = req.body;

    if (!userId || !role || !content || !language) {
      res.status(400).json({ error: 'userId, role, content, and language are required' });
      return;
    }

    const result = await query(
      'INSERT INTO chat_messages (user_id, role, content, language) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, role, content, language]
    );

    res.json({ message: result.rows[0] });
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
