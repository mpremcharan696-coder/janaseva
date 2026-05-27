-- SchemeSetu AI - PostgreSQL Schema Definition
-- Optimized for Neon.tech

-- Enable the pgcrypto extension for UUID generation (if not natively supported, though gen_random_uuid() is built-in in PG 13+)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- Table: user_profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    age INT CHECK (age >= 0),
    gender VARCHAR(50),
    occupation VARCHAR(150),
    annual_income DECIMAL(15, 2) DEFAULT 0.00,
    state VARCHAR(100),
    is_farmer BOOLEAN DEFAULT FALSE,
    is_student BOOLEAN DEFAULT FALSE,
    is_senior_citizen BOOLEAN DEFAULT FALSE,
    is_startup_founder BOOLEAN DEFAULT FALSE,
    is_unemployed BOOLEAN DEFAULT FALSE,
    is_female_student BOOLEAN DEFAULT FALSE,
    is_working_female BOOLEAN DEFAULT FALSE,
    is_pregnant_woman BOOLEAN DEFAULT FALSE,
    is_widow BOOLEAN DEFAULT FALSE,
    is_single_mother BOOLEAN DEFAULT FALSE,
    is_other_profession BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for common lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_state ON user_profiles(state);

-- ==============================================================================
-- Table: schemes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., Agriculture, Education, Healthcare
    ministry VARCHAR(255),
    benefits TEXT,
    eligibility_criteria JSONB, -- Flexible storage for varying criteria keys
    documents_required TEXT[], -- Array of strings for document names
    application_process TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for JSONB criteria search and category filtering
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_eligibility ON schemes USING GIN (eligibility_criteria);

-- ==============================================================================
-- Table: applications
-- ==============================================================================
-- Define an ENUM for application status if preferred, or use a CHECK constraint.
-- Here we use a CHECK constraint for simplicity and portability.
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    scheme_id UUID NOT NULL,
    application_status VARCHAR(50) DEFAULT 'PENDING' 
        CHECK (application_status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES user_profiles(id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_scheme
        FOREIGN KEY(scheme_id) 
        REFERENCES schemes(id)
        ON DELETE CASCADE
);

-- Indexes to speed up queries for a user's applications or a scheme's applicants
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON applications(scheme_id);

-- ==============================================================================
-- Update Triggers for `updated_at` columns
-- ==============================================================================
-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_user_profiles_modtime
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_schemes_modtime
    BEFORE UPDATE ON schemes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_applications_modtime
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
