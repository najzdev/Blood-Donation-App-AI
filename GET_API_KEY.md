# Generate a Valid Gemini API Key

## Step 1: Go to Google AI Studio
1. Open: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account

## Step 2: Create or Get API Key
1. Click **"Create API Key"** or **"Get API Key"**
2. Select **"Create new API key in new project"** if prompted
3. Wait for the project to be created
4. Copy the generated API key

## Step 3: Update Your .env File
1. Open `/server/.env` file
2. Replace the old key with the new one:
```
GEMINI_API_KEY=AIza_YOUR_NEW_KEY_HERE
```
3. Save the file

## Step 4: Test the New Key
```bash
cd server
node test-gemini.js
```

## Step 5: If Still Getting 404 Errors

The issue might be that the free tier currently doesn't have gemini-1.5-flash available. Try this:

1. Go to: **https://aistudio.google.com/app/apikey**
2. Make sure API is **enabled**
3. Try the test again

## Alternative: Use Different Model

If issues persist, we can use the REST API directly with curl. But first, verify your new key works by going to:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

Replace `YOUR_API_KEY` with your actual key.

## If You Don't Have a Google Account

1. Create one at: https://accounts.google.com
2. Then follow the steps above

---

## Important Notes

- ⚠️ **Don't share your API key** publicly or commit it to git
- Each API key can make thousands of free requests per day
- Free tier is limited to requests from whitelisted websites
- Save your key somewhere safe

---

## Need Help?

After updating your .env file with a new API key:

```bash
# Test the key
node test-gemini.js

# If that works, start the server
npm run dev
```

Then try the AI chat and matching features in the app!
