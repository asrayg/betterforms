-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  published BOOLEAN DEFAULT false,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('short', 'long', 'mcq', 'checkbox', 'email', 'number', 'date', 'time', 'linear_scale')),
  prompt TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  options JSONB,
  validation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  respondent_meta JSONB,
  respondent_email TEXT
);

-- Add columns to existing tables if they don't exist (for existing databases)
DO $$ 
BEGIN
  -- Add settings to forms if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'settings'
  ) THEN
    ALTER TABLE forms ADD COLUMN settings JSONB;
  END IF;

  -- Add validation to questions if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'validation'
  ) THEN
    ALTER TABLE questions ADD COLUMN validation JSONB;
  END IF;

  -- Add respondent_email to responses if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'responses' AND column_name = 'respondent_email'
  ) THEN
    ALTER TABLE responses ADD COLUMN respondent_email TEXT;
  END IF;
END $$;

-- Update question type constraint if it exists
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'questions_type_check' AND table_name = 'questions'
  ) THEN
    ALTER TABLE questions DROP CONSTRAINT questions_type_check;
  END IF;
  
  -- Add new constraint with all question types
  ALTER TABLE questions ADD CONSTRAINT questions_type_check 
    CHECK (type IN ('short', 'long', 'mcq', 'checkbox', 'email', 'number', 'date', 'time', 'linear_scale'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  audio_url TEXT,
  transcript_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forms_owner_id ON forms(owner_id);
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON questions(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_respondent_email ON responses(respondent_email);
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Row Level Security Policies

-- Forms: owners can do everything, public can read published forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their forms"
  ON forms
  FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Public can read published forms"
  ON forms
  FOR SELECT
  USING (published = true);

-- Questions: owners can manage, public can read for published forms
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage questions for their forms"
  ON questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND forms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can read questions for published forms"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND forms.published = true
    )
  );

-- Responses: public can insert, owners can read their form responses
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create responses"
  ON responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can read responses for their forms"
  ON responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = responses.form_id
      AND forms.owner_id = auth.uid()
    )
  );

-- Answers: public can insert, owners can read for their forms
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create answers"
  ON answers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can read answers for their forms"
  ON answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM responses
      JOIN forms ON forms.id = responses.form_id
      WHERE responses.id = answers.response_id
      AND forms.owner_id = auth.uid()
    )
  );

