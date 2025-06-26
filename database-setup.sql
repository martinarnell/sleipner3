-- Sleipner Database Setup
-- Run this script in your Supabase SQL editor

-- Create api_keys table for managing user API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON api_keys TO authenticated;
GRANT ALL ON api_keys TO service_role; 