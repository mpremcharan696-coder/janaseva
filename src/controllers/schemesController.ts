import { Request, Response } from 'express';
import { query } from '../lib/db.js';

export const getSchemes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    
    let sql = `SELECT * FROM schemes`;
    const params: any[] = [];

    // Optional filtering by category
    if (category && typeof category === 'string') {
      sql += ` WHERE category = $1`;
      params.push(category);
    }

    // Order by creation date descending
    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in getSchemes:', error);
    res.status(500).json({ error: 'Failed to fetch schemes from the database' });
  }
};

export const getSchemeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Optional: Validate UUID format here if necessary
    const result = await query(`SELECT * FROM schemes WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Scheme not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error in getSchemeById:', error);
    res.status(500).json({ error: 'Failed to fetch scheme details' });
  }
};
