-- Migration: Add password_hash column to users table
-- Run this if you have an existing database

USE TimeGarden;

-- Add password_hash column
ALTER TABLE users 
ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER display_name;

-- Add timestamps if they don't exist
ALTER TABLE users 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER password_hash;

ALTER TABLE users 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Update existing users with a default password (users should change this)
-- In production, you'd want to force password reset
UPDATE users 
SET password_hash = '$2a$10$default.hash.here.for.existing.users' 
WHERE password_hash = '';

