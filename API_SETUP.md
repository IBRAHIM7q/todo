# Google API Setup Instructions

## Security Issue Fixed

We've fixed a security issue where a Google API key was hardcoded in the code. The key has been removed from the code and should be stored in environment variables instead.

## Steps to Set Up Your API Key

1. **Revoke the Exposed API Key**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Find the exposed API key and click "Revoke"

2. **Create a New API Key**
   - In the Google Cloud Console, create a new API key
   - Set appropriate restrictions for the API key (recommended)

3. **Update Your Environment Variables**
   - Open the `.env` file in the project root
   - Replace `your_new_api_key_here` with your actual new API key:
     ```
     GOOGLE_AI_API_KEY=your_actual_new_api_key
     ```

4. **Test Your Setup**
   - Run `node test-ai.js` to verify everything works

## Best Practices for API Key Security

- Never commit API keys or secrets to version control
- Always use environment variables for sensitive information
- Restrict API keys to specific services and IP addresses when possible
- Regularly rotate API keys, especially for production environments

## Troubleshooting

If you encounter an "API key not valid" error, make sure:
1. You've created a new valid API key in the Google Cloud Console
2. The API key has access to the Generative AI API
3. The API key is correctly set in your `.env` file
4. There are no spaces or quotes around your API key in the `.env` file