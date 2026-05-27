import { Pool } from 'pg';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
// In a typical Node/Express app, you might only call this once at the very entry point.
// If you are using Vite in the backend or Next.js, env variables may be loaded automatically.
dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL environment variable is not set. Database integration will be disabled, running in mock/in-memory mode.');
}

// Clean connection string to prevent pg library from strictly verifying SSL certs in production
if (connectionString) {
  if (connectionString.includes('sslmode=require')) {
    connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
  }
  if (connectionString.includes('channel_binding=require')) {
    connectionString = connectionString.replace('channel_binding=require', 'channel_binding=disable');
  }
}

// Initialize the connection pool if connection string exists
const pool = connectionString ? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5, // Neon free tier: keep pool small
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // 10 seconds — allows for Neon cold start wake-up
}) : null;

// Run database schema upgrades on startup to support persistent authentication if database is connected
if (pool) {
  (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id VARCHAR(255) PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS applications (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          scheme_id VARCHAR(255),
          application_status VARCHAR(50) DEFAULT 'PENDING',
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS schemes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          benefits TEXT,
          eligibility_criteria JSONB,
          documents_required TEXT[],
          application_process TEXT,
          deadline TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          language VARCHAR(10) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_user;
        ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS fk_chat_user;
        ALTER TABLE user_profiles ALTER COLUMN id TYPE VARCHAR(255);
        ALTER TABLE applications ALTER COLUMN user_id TYPE VARCHAR(255);
        ALTER TABLE applications ADD CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
        ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_user FOREIGN KEY(user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS age INTEGER,
        ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
        ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
        ADD COLUMN IF NOT EXISTS annual_income VARCHAR(50),
        ADD COLUMN IF NOT EXISTS state VARCHAR(100),
        ADD COLUMN IF NOT EXISTS is_farmer BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_senior_citizen BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_startup_founder BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_unemployed BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_female_student BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_working_female BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_pregnant_woman BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_widow BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_single_mother BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS is_other_profession BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS jana_seva_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS is_differently_abled BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS family_size INTEGER DEFAULT 1 NOT NULL,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_email_key') THEN
                BEGIN
                    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Could not add unique constraint on email: %', SQLERRM;
                END;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_jana_seva_id_key') THEN
                BEGIN
                    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_jana_seva_id_key UNIQUE (jana_seva_id);
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Could not add unique constraint on jana_seva_id: %', SQLERRM;
                END;
            END IF;
        END $$;
      `);
      console.log('✅ Database auto-migrations for authentication completed successfully!');
    } catch (err) {
      // Migration failure is non-fatal — app continues running
      // This can happen on first deploy due to Neon cold start; subsequent requests will work
      console.error('⚠️ Database migration failed (non-fatal, server will continue):', (err as Error).message);
    }
  })();
}

// In-memory mock database store for development / offline deployment
const mockUsersStore = new Map<string, any>();

// A helper function to run queries
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    console.log('🔌 Offline DB query executing:', { text, params });
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('select now()')) {
      return { rows: [{ now: new Date() }], rowCount: 1 };
    }

    if (lowerText.includes('select * from schemes')) {
      return { rows: [], rowCount: 0 };
    }

    if (lowerText.includes('select * from user_profiles')) {
      const idOrEmail = params?.[0];
      if (!idOrEmail) return { rows: [], rowCount: 0 };
      
      // Look up by id or email in the memory store
      const users = Array.from(mockUsersStore.values());
      const matchedUser = users.find(u => u.id === idOrEmail || u.email === idOrEmail);
      return { rows: matchedUser ? [matchedUser] : [], rowCount: matchedUser ? 1 : 0 };
    }

    if (lowerText.includes('select * from applications')) {
      return { rows: [], rowCount: 0 };
    }

    if (lowerText.includes('insert into user_profiles')) {
      // params matches: finalUid, profile.name, age, gender, occupation, income, location, isFarmer...
      const mockUser = {
        id: params?.[0],
        full_name: params?.[1],
        age: params?.[2],
        gender: params?.[3],
        occupation: params?.[4],
        annual_income: params?.[5],
        state: params?.[6],
        is_farmer: params?.[7],
        is_student: params?.[8],
        is_senior_citizen: params?.[9],
        is_startup_founder: params?.[10],
        is_unemployed: params?.[11],
        is_female_student: params?.[12],
        is_working_female: params?.[13],
        is_pregnant_woman: params?.[14],
        is_widow: params?.[15],
        is_single_mother: params?.[16],
        is_other_profession: params?.[17],
        email: params?.[18],
        jana_seva_id: params?.[19],
        is_differently_abled: params?.[20] || false,
        family_size: params?.[21] || 1,
      };
      mockUsersStore.set(mockUser.id, mockUser);
      return { rows: [mockUser], rowCount: 1 };
    }

    if (lowerText.includes('update user_profiles')) {
      // params matches: full_name, age, gender, occupation, annual_income, state, is_farmer... id
      const id = params?.[19];
      if (!id) return { rows: [], rowCount: 0 };
      
      const existingUser = mockUsersStore.get(id) || {};
      const updatedUser = {
        ...existingUser,
        id,
        full_name: params?.[0],
        age: params?.[1],
        gender: params?.[2],
        occupation: params?.[3],
        annual_income: params?.[4],
        state: params?.[5],
        is_farmer: params?.[6],
        is_student: params?.[7],
        is_senior_citizen: params?.[8],
        is_startup_founder: params?.[9],
        is_unemployed: params?.[10],
        is_female_student: params?.[11],
        is_working_female: params?.[12],
        is_pregnant_woman: params?.[13],
        is_widow: params?.[14],
        is_single_mother: params?.[15],
        is_other_profession: params?.[16],
        is_differently_abled: params?.[17] || false,
        family_size: params?.[18] || 1,
      };
      mockUsersStore.set(id, updatedUser);
      return { rows: [updatedUser], rowCount: 1 };
    }

    if (lowerText.includes('select * from chat_messages')) {
      return { rows: [], rowCount: 0 };
    }

    if (lowerText.includes('insert into chat_messages')) {
      return { rows: [{ id: Math.floor(Math.random() * 1000) }], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
};

export default pool;
