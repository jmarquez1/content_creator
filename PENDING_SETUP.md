# Pending Setup Items

## Required Steps (Do These First)

### 1. Run Database Migrations
Go to your Supabase Dashboard:
1. Open https://jsvfeyrxoyvvjhwobtkg.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Copy/paste the entire contents of `SETUP_DATABASE.sql`
4. Click **Run**

### 2. Install Dependencies & Start App
```bash
cd "E:\DropBox\FUTSolutions Dropbox\Jesus Ortigosa\Personal\2 Businesses\Marquez Consulting\Cursors\contentcreation"
npm install
npm run dev
```

Then open http://localhost:3000

---

## Optional API Keys (For Trend Research Feature)

These are only needed if you want to use the Trends feature to research Reddit/YouTube trends.

### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..."
3. Select "script" type
4. Set redirect URI to `http://localhost:3000/api/auth/reddit/callback`
5. Copy the client ID (under app name) and secret
6. Add to `.env.local`:
```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_secret
```

### YouTube Data API
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "YouTube Data API v3"
4. Create API key (restrict to YouTube Data API)
5. Add to `.env.local`:
```
YOUTUBE_API_KEY=your_youtube_api_key
```

---

## Security Reminder

⚠️ **IMPORTANT**: You shared your API keys in a conversation. For security:

1. **Rotate your OpenAI API key**: https://platform.openai.com/api-keys
2. **Rotate your Supabase keys** (optional but recommended):
   - Go to Supabase Dashboard → Settings → API
   - Generate new anon and service role keys
   - Update `.env.local` with new keys

---

## App Features Checklist

Once set up, you can:
- [ ] Sign up / Login
- [ ] Create ideas from plain text input
- [ ] Create ideas from YouTube URLs (transcript extraction)
- [ ] Create ideas from uploaded documents (PDF, TXT, MD)
- [ ] Run trend research (requires Reddit/YouTube API keys)
- [ ] Generate posts for LinkedIn, Instagram, Facebook
- [ ] Create post variants (different tone, length, angle)
- [ ] View full audit trail of all AI generations
- [ ] Manage voice profiles and platform profiles
