# Deploy SUMAD TRAFFIC MGT Online

**Vercel** = React frontend (public)  
**Render** = Node API + Socket.io (required; Vercel cannot run this backend)

---

## Step 1 — Install Git (if missing)

Download: https://git-scm.com/download/win  
Restart terminal after install.

---

## Step 2 — Push to GitHub

```powershell
cd c:\Users\admin\Documents\sumad-traffic-mgt
git init
git add .
git commit -m "SUMAD TRAFFIC MGT - full stack traffic system"
```

Create repo on GitHub: https://github.com/new → name: `sumad-traffic-mgt` → **Public**

```powershell
git remote add origin https://github.com/YOUR_USERNAME/sumad-traffic-mgt.git
git branch -M main
git push -u origin main
```

Or with GitHub CLI:

```powershell
gh auth login
gh repo create sumad-traffic-mgt --public --source=. --push
```

**Never commit `server/.env`** — it is in `.gitignore`.

---

## Step 3 — Deploy API on Render (free)

1. Go to https://render.com → Sign up → **New +** → **Blueprint**
2. Connect your GitHub repo `sumad-traffic-mgt`
3. Render reads `render.yaml` automatically
4. Set environment variables when prompted:
   - `DATABASE_URL` = your Neon PostgreSQL URL
   - `CLIENT_URL` = `https://your-app.vercel.app` (update after Vercel deploy)
5. Deploy → copy API URL, e.g. `https://sumad-traffic-api.onrender.com`

Run seed once (Render Shell):

```bash
cd server && npm run db:seed
```

---

## Step 4 — Deploy frontend on Vercel (public)

1. Go to https://vercel.com → Sign up with GitHub
2. **Add New Project** → Import `sumad-traffic-mgt`
3. Settings:
   - **Root Directory:** `client`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://sumad-traffic-api.onrender.com` |

5. **Deploy** → your public URL: `https://sumad-traffic-mgt.vercel.app`

---

## Step 5 — Link frontend ↔ API

In **Render** → your API service → **Environment**:

```
CLIENT_URL=https://your-project.vercel.app
```

Redeploy API. Done.

---

## Quick deploy with CLI

```powershell
npm i -g vercel
cd client
vercel --prod
# Set VITE_API_URL when prompted
```

---

## Demo login (production)

- Email: `admin@sumad.gov`
- Password: `Password123!`

Run `npm run db:seed` on Render if users are missing.
