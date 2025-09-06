# Supabase Setup Instructions

This guide will help you set up Supabase authentication and database for GitMap.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `gitmap` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose the closest to your users
4. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Copy `.env.local` to `.env.local` in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` and paste it into the SQL editor
3. Click "Run" to execute the SQL and create the necessary tables and policies

## 5. Configure Authentication Providers

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
7. Copy the Client ID and Client Secret
8. In Supabase dashboard, go to **Authentication** → **Providers** → **Google**
9. Enable Google provider and enter your Client ID and Client Secret

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: `GitMap`
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy the Client ID and generate a Client Secret
5. In Supabase dashboard, go to **Authentication** → **Providers** → **GitHub**
6. Enable GitHub provider and enter your Client ID and Client Secret

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click "New registration"
4. Fill in the details:
   - Name: `GitMap`
   - Supported account types: Choose appropriate option
   - Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. After creation, go to **Certificates & secrets** → **New client secret**
6. Copy the Client ID and Client Secret
7. In Supabase dashboard, go to **Authentication** → **Providers** → **Microsoft**
8. Enable Microsoft provider and enter your Client ID and Client Secret

## 6. Configure Email Settings (Optional)

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your email settings:
   - **Site URL**: `http://localhost:3000` (or your domain)
   - **Redirect URLs**: Add your domain
3. Optionally configure custom SMTP settings for email delivery

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign In" and test the authentication providers
4. Try adding a repository to test the history saving functionality

## 8. Production Deployment

When deploying to production:

1. Update your environment variables with production values
2. Update the redirect URLs in your OAuth provider settings to use your production domain
3. Update the Site URL in Supabase Authentication settings
4. Consider setting up custom SMTP for better email delivery

## Troubleshooting

### Common Issues

1. **"Invalid redirect URL"**: Make sure your OAuth provider redirect URLs match exactly
2. **"Database connection failed"**: Check your environment variables are correct
3. **"RLS policy violation"**: Ensure the database schema was created correctly
4. **"Email not sending"**: Check your email settings in Supabase

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)