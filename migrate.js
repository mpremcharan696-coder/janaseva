import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=no-verify').replace('channel_binding=require', 'channel_binding=disable'),
  ssl: { rejectUnauthorized: false }
});

const query = `
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
`;

pool.query(query).then(() => {
  console.log('Migration completed successfully.');
  pool.end();
}).catch(err => {
  console.error('Migration failed:', err);
  pool.end();
});
