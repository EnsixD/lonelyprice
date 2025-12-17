-- Create admin account (you can login with these credentials)
-- Email: admin@lonely-prize.ru
-- Password: AdminLonelyPrize2025!

-- First, create the auth user (this will be handled by Supabase Auth in your app)
-- You need to register this user through the registration form first, then run this script to make them admin

-- Update existing user to admin (replace 'admin@lonely-prize.ru' with your actual admin email)
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@lonely-prize.ru'
);

-- Alternative: If you want to set ANY specific user as admin by their email
-- Just replace 'your-email@example.com' with the email you registered with
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
