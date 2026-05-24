import { Request, Response } from 'express';
import { query } from '../lib/db.js';
import crypto from 'crypto';

// Helper to generate a premium Citizen ID (JS-XXXX-XXXX)
const generateCitizenId = (): string => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `JS-${part1}-${part2}`;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid, email } = req.body;

    if (!uid && !email) {
      res.status(400).json({ error: 'UID or Email is required' });
      return;
    }

    const trimmedEmail = email ? email.trim().toLowerCase() : null;

    // Check if user profile exists by UID or email
    let userResult;
    if (uid) {
      userResult = await query('SELECT * FROM user_profiles WHERE id = $1', [uid]);
    }
    
    if (!userResult || userResult.rows.length === 0) {
      if (trimmedEmail) {
        userResult = await query('SELECT * FROM user_profiles WHERE email = $1', [trimmedEmail]);
      }
    }

    if (!userResult || userResult.rows.length === 0) {
      res.status(200).json({ exists: false });
      return;
    }

    const profile = userResult.rows[0];

    // Fetch user applications
    const appsResult = await query(
      'SELECT * FROM applications WHERE user_id = $1',
      [profile.id]
    );

    res.status(200).json({
      exists: true,
      profile: {
        id: profile.id,
        name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        occupation: profile.occupation,
        income: parseFloat(profile.annual_income || '0'),
        location: profile.state,
        email: profile.email,
        jana_seva_id: profile.jana_seva_id,
        demographics: {
          isFarmer: profile.is_farmer,
          isStudent: profile.is_student,
          isSeniorCitizen: profile.is_senior_citizen,
          isStartupFounder: profile.is_startup_founder,
          isUnemployed: profile.is_unemployed,
          isFemaleStudent: profile.is_female_student,
          isWorkingFemale: profile.is_working_female,
          isPregnantWoman: profile.is_pregnant_woman,
          isWidow: profile.is_widow,
          isSingleMother: profile.is_single_mother,
          isOtherProfession: profile.is_other_profession,
          isDifferentlyAbled: profile.is_differently_abled,
          familySize: profile.family_size
        }
      },
      applications: appsResult.rows.map(app => ({
        id: app.id,
        schemeId: app.scheme_id,
        schemeName: 'Applied Scheme', // The frontend maps the name from the schemes list or we can return a default
        status: app.application_status === 'PENDING' ? 'In Review' : 
                app.application_status === 'APPROVED' ? 'Approved' : 'In Review',
        appliedDate: new Date(app.applied_at).toISOString().split('T')[0],
        lastUpdated: new Date(app.updated_at).toISOString().split('T')[0],
        nextStep: app.application_status === 'APPROVED' ? 'Grant Disbursement' : 'Verification by Block Officer'
      }))
    });

  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid, email, profile } = req.body;

    if (!email || !profile) {
      res.status(400).json({ error: 'Email and profile data are required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const citizenId = generateCitizenId();
    const finalUid = uid || crypto.randomUUID();

    const d = profile.demographics || {};

    const insertSql = `
      INSERT INTO user_profiles 
        (id, full_name, age, gender, occupation, annual_income, state, is_farmer, is_student, is_senior_citizen,
         is_startup_founder, is_unemployed, is_female_student, is_working_female, is_pregnant_woman,
         is_widow, is_single_mother, is_other_profession, email, jana_seva_id, is_differently_abled, family_size)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        occupation = EXCLUDED.occupation,
        annual_income = EXCLUDED.annual_income,
        state = EXCLUDED.state,
        is_farmer = EXCLUDED.is_farmer,
        is_student = EXCLUDED.is_student,
        is_senior_citizen = EXCLUDED.is_senior_citizen,
        is_startup_founder = EXCLUDED.is_startup_founder,
        is_unemployed = EXCLUDED.is_unemployed,
        is_female_student = EXCLUDED.is_female_student,
        is_working_female = EXCLUDED.is_working_female,
        is_pregnant_woman = EXCLUDED.is_pregnant_woman,
        is_widow = EXCLUDED.is_widow,
        is_single_mother = EXCLUDED.is_single_mother,
        is_other_profession = EXCLUDED.is_other_profession,
        is_differently_abled = EXCLUDED.is_differently_abled,
        family_size = EXCLUDED.family_size,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const insertParams = [
      finalUid,
      profile.name,
      profile.age || null,
      profile.gender || null,
      profile.occupation || null,
      profile.income || 0,
      profile.location || null,
      d.isFarmer || false,
      d.isStudent || false,
      d.isSeniorCitizen || false,
      d.isStartupFounder || false,
      d.isUnemployed || false,
      d.isFemaleStudent || false,
      d.isWorkingFemale || false,
      d.isPregnantWoman || false,
      d.isWidow || false,
      d.isSingleMother || false,
      d.isOtherProfession || false,
      trimmedEmail,
      citizenId,
      d.isDifferentlyAbled || false,
      d.familySize || 1
    ];

    const result = await query(insertSql, insertParams);
    const createdProfile = result.rows[0];

    res.status(201).json({
      profile: {
        id: createdProfile.id,
        name: createdProfile.full_name,
        age: createdProfile.age,
        gender: createdProfile.gender,
        occupation: createdProfile.occupation,
        income: parseFloat(createdProfile.annual_income || '0'),
        location: createdProfile.state,
        email: createdProfile.email,
        jana_seva_id: createdProfile.jana_seva_id,
        demographics: {
          isFarmer: createdProfile.is_farmer,
          isStudent: createdProfile.is_student,
          isSeniorCitizen: createdProfile.is_senior_citizen,
          isStartupFounder: createdProfile.is_startup_founder,
          isUnemployed: createdProfile.is_unemployed,
          isFemaleStudent: createdProfile.is_female_student,
          isWorkingFemale: createdProfile.is_working_female,
          isPregnantWoman: createdProfile.is_pregnant_woman,
          isWidow: createdProfile.is_widow,
          isSingleMother: createdProfile.is_single_mother,
          isOtherProfession: createdProfile.is_other_profession,
          isDifferentlyAbled: createdProfile.is_differently_abled,
          familySize: createdProfile.family_size
        }
      },
      applications: []
    });

  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
};
