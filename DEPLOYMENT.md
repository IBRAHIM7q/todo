# Deployment to Netlify

## Prerequisites

1. A Netlify account
2. This repository connected to Netlify

## Deployment Steps

1. Connect your repository to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `.next`
4. Add environment variables in Netlify:
   - `DATABASE_URL` - For production, consider using a proper database service
   - `GOOGLE_AI_API_KEY` - Your Google AI API key
   - `NEXTAUTH_SECRET` - A random string for NextAuth

## Database Configuration

This application uses SQLite for simplicity. For production deployments:

1. The application will automatically create a `custom.db` file on Netlify
2. Database migrations will run automatically during the build process

## Environment Variables

Set the following environment variables in your Netlify dashboard:

```
DATABASE_URL="file:./custom.db"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
NEXTAUTH_SECRET="your-random-secret-string"
```

## Troubleshooting

If tasks are not working after deployment:

1. Check the Netlify build logs for database migration errors
2. Ensure all environment variables are set correctly
3. Verify that the Google AI API key is valid
4. Check the browser console for any JavaScript errors