# Blog Frontend - Next.js 16 Web Application

The frontend client application for the blog system, built with **Next.js 16 (App Router)** following **Clean Architecture & SOLID** principles. Features an interactive Editor.js block editor, post creation via OCR note ingestion, post editing/deletion management, private posts support, and toast notifications.

---

## Live Production URL

The application is deployed and live at:
👉 **[https://blog-frontend-jade-seven.vercel.app/](https://blog-frontend-jade-seven.vercel.app/)**

---

## Environment Variables

Configure the following variables in `.env.local` (for local development) and in the Vercel Dashboard (for production deployment):

```env
NEXT_PUBLIC_API_URL=https://blog-backend-hwz2crveta-ew.a.run.app
NEXT_PUBLIC_OCR_API_URL=https://blog-ocr-agent-hwz2crveta-ew.a.run.app
```

---

## Local Development Setup

1. Navigate to the project directory:
   ```bash
   cd blog-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the web application.

---

## Production Deployment on Vercel

The application is connected to the **Vercel** platform. There are two primary deployment workflows:

### Method 1: Automatic Deployment via Git (Recommended)
Vercel is linked directly to the `main` branch of the GitHub repository. Any `git push` or merged Pull Request to the `main` branch automatically triggers a new production build and deployment.

### Method 2: Manual Deployment via Vercel CLI

To manually trigger a deployment directly from your command line:

1. Authenticate with Vercel CLI (one-time setup):
   ```bash
   npx vercel login
   ```

2. Deploy the project to production:
   ```bash
   npx vercel --prod
   ```

Vercel will compile the application (`npm run build`) and update the live deployment at `https://blog-frontend-jade-seven.vercel.app/`.

---

## Backend CORS Configuration

After deploying to Vercel, ensure that your production frontend domain (`blog-frontend-jade-seven.vercel.app`) is included in the `CORS_ALLOWED_HOSTS` environment variable of the Cloud Run backend (`blog-backend`).
