-- Add restriction period for warning members
ALTER TABLE members ADD COLUMN restriction_until TIMESTAMP;
