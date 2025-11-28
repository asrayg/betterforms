-- Migration script to update existing database with new features
-- Run this if you already have the base schema and need to add new columns

-- Add settings column to forms table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'settings'
  ) THEN
    ALTER TABLE forms ADD COLUMN settings JSONB;
  END IF;
END $$;

-- Add validation column to questions table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'validation'
  ) THEN
    ALTER TABLE questions ADD COLUMN validation JSONB;
  END IF;
END $$;

-- Update question type constraint to include new types
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check 
  CHECK (type IN ('short', 'long', 'mcq', 'checkbox', 'email', 'number', 'date', 'time', 'linear_scale'));

-- Add respondent_email column to responses table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'responses' AND column_name = 'respondent_email'
  ) THEN
    ALTER TABLE responses ADD COLUMN respondent_email TEXT;
  END IF;
END $$;

-- Create index on respondent_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_responses_respondent_email ON responses(respondent_email);

