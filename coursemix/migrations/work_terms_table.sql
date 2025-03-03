-- Create work_terms table
CREATE TABLE IF NOT EXISTS work_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_name TEXT NOT NULL,
  company_name TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Create unique constraint to ensure each user can only have one entry per term name
  UNIQUE (user_id, term_name)
);

-- Enable RLS (Row Level Security)
ALTER TABLE work_terms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own work terms
CREATE POLICY "Users can view their own work terms" ON work_terms
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to create their own work terms
CREATE POLICY "Users can create their own work terms" ON work_terms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own work terms
CREATE POLICY "Users can update their own work terms" ON work_terms
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own work terms
CREATE POLICY "Users can delete their own work terms" ON work_terms
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger function (if it doesn't already exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at column on changes
CREATE TRIGGER update_work_terms_updated_at
BEFORE UPDATE ON work_terms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 