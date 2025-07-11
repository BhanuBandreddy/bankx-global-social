-- Update demo user email from demo@pathsync.com to demo@globalsocial.com
UPDATE auth.users 
SET email = 'demo@globalsocial.com',
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{email}',
      '"demo@globalsocial.com"'
    )
WHERE email = 'demo@pathsync.com';

-- If no existing user, create the demo user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@globalsocial.com',
  crypt('PathSync2024!', gen_salt('bf')),
  now(),
  '{"full_name": "Demo User", "email": "demo@globalsocial.com"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo@globalsocial.com'
);