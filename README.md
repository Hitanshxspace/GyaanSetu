# GyanSetu — Vercel Deployment (OpenRouter, free tier)

## Steps

### 1. Get your FREE OpenRouter API key
- Go to https://openrouter.ai → Sign up with Google
- Keys → Create Key → copy it (starts with sk-or-...)
- No credit card needed, free models available

### 2. Push to GitHub
```bash
git add .
git commit -m "gyansetu v9 openrouter"
git push
```

### 3. On Vercel
Settings → Environment Variables → Add:
  OPENROUTER_API_KEY = sk-or-your-key-here
Then Deployments → Redeploy

### Done
Users who open the site enter their own key once (saved in browser).
On Vercel deployment, your key is used server-side automatically.
