import { Request, Response } from 'express';
import { query } from '../lib/db.js';

export const upsertUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id,
      full_name,
      age,
      gender,
      occupation,
      annual_income,
      state,
      is_farmer,
      is_student,
      is_senior_citizen,
      is_startup_founder,
      is_unemployed,
      is_female_student,
      is_working_female,
      is_pregnant_woman,
      is_widow,
      is_single_mother,
      is_other_profession,
      is_differently_abled,
      family_size
    } = req.body;

    // Basic validation
    if (!full_name) {
      res.status(400).json({ error: 'full_name is required' });
      return;
    }

    if (id) {
      // If ID is provided, try to update first
      const updateSql = `
        UPDATE user_profiles 
        SET full_name = $1, age = $2, gender = $3, occupation = $4, annual_income = $5, state = $6, 
            is_farmer = $7, is_student = $8, is_senior_citizen = $9,
            is_startup_founder = $10, is_unemployed = $11, is_female_student = $12, is_working_female = $13,
            is_pregnant_woman = $14, is_widow = $15, is_single_mother = $16, is_other_profession = $17,
            is_differently_abled = $18, family_size = $19,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $20
        RETURNING *;
      `;
      const updateParams = [
        full_name, age || null, gender || null, occupation || null, annual_income || 0, state || null,
        is_farmer || false, is_student || false, is_senior_citizen || false,
        is_startup_founder || false, is_unemployed || false, is_female_student || false, is_working_female || false,
        is_pregnant_woman || false, is_widow || false, is_single_mother || false, is_other_profession || false,
        is_differently_abled || false, family_size || 1,
        id
      ];

      const updateResult = await query(updateSql, updateParams);
      
      if (updateResult.rows.length > 0) {
        // Successfully updated
        res.status(200).json(updateResult.rows[0]);
        return;
      }
      
      // If id was provided but not found, you could choose to return 404 or fall through to INSERT
      // Here we choose to return 400 since an invalid ID was provided
      res.status(400).json({ error: 'User profile with the provided ID not found' });
      return;
    }

    // No ID provided, perform an INSERT
    const insertSql = `
      INSERT INTO user_profiles 
        (full_name, age, gender, occupation, annual_income, state, is_farmer, is_student, is_senior_citizen,
         is_startup_founder, is_unemployed, is_female_student, is_working_female, is_pregnant_woman,
         is_widow, is_single_mother, is_other_profession, is_differently_abled, family_size)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;
    const insertParams = [
      full_name, age || null, gender || null, occupation || null, annual_income || 0, state || null,
      is_farmer || false, is_student || false, is_senior_citizen || false,
      is_startup_founder || false, is_unemployed || false, is_female_student || false, is_working_female || false,
      is_pregnant_woman || false, is_widow || false, is_single_mother || false, is_other_profession || false,
      is_differently_abled || false, family_size || 1
    ];

    const insertResult = await query(insertSql, insertParams);
    
    // 201 Created
    res.status(201).json(insertResult.rows[0]);

  } catch (error) {
    console.error('Error in upsertUserProfile:', error);
    res.status(500).json({ error: 'Failed to process user profile' });
  }
};
