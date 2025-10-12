# Google OAuth Setup Guide

To enable real Google sign-in for your Case Index RT application, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth client ID"
6. Choose "Web application" as the application type
7. Add your domain to "Authorized JavaScript origins":
   - `http://localhost:3000` (for development)
   - `http://localhost:3001` (if port 3000 is busy)
   - `http://localhost:3002` (if port 3001 is busy)
   - `http://localhost:3003` (if port 3002 is busy)
   - Your production domain (e.g., `https://yourdomain.com`)

## 2. Get Your Client ID

1. After creating the OAuth client, copy the "Client ID"
2. It will look like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

## 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id-here
```

Replace `your-actual-client-id-here` with the Client ID from step 2.

## 4. Restart Your Development Server

After adding the environment variable:

```bash
npm run dev
```

## 5. Test Google Sign-In

1. Go to your login page
2. Click "Continue with Google"
3. You should see the real Google sign-in popup
4. Sign in with your Google account
5. You should be redirected to the dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**: Make sure your Client ID is correct and the domain is authorized
2. **"This app isn't verified"**: This is normal for development. Click "Advanced" → "Go to [app name] (unsafe)"
3. **CORS errors**: Make sure your domain is added to "Authorized JavaScript origins"

### Development vs Production:

- **Development**: Use `http://localhost:3000` (or whatever port your app runs on)
- **Production**: Use your actual domain (e.g., `https://caseindexrt.com`)

## Security Notes:

- Never commit your `.env.local` file to version control
- Keep your Client ID secure
- Use different Client IDs for development and production
- Regularly rotate your OAuth credentials

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Client ID is correct
3. Ensure your domain is authorized in Google Console
4. Make sure the Google+ API is enabled