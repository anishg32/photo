# MJ PHOTOGRAPHY — Deployment Guide (Firebase + Vercel)

## 1. Prerequisites
- Node.js 20+ (tested on Node 26)
- Firebase project (`Blaze` plan if deploying Cloud Functions v2)
- Vercel account for Next.js App Router hosting

---

## 2. Firebase Project Provisioning

1. **Create a Firebase Project** in the [Firebase Console](https://console.firebase.google.com/).
2. **Enable Authentication**:
   - Navigate to **Build → Authentication → Sign-in method**.
   - Enable **Email/Password** (do NOT enable open public admin registration).
   - Create your studio administrator account in **Authentication → Users**.
3. **Enable Cloud Firestore & Storage**:
   - Create a Firestore database in Production Mode.
   - Enable Firebase Storage in Production Mode.
4. **Enable Firebase App Check**:
   - Register your web app under **Build → App Check** using reCAPTCHA v3 (or Enterprise) and note your public Site Key (`NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`).
5. **Deploy Rules, Indexes & Cloud Functions**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # select your Firebase project ID
   cd functions && npm install && npm run build && cd ..
   firebase deploy --only firestore:rules,firestore:indexes,storage,functions
   ```

---

## 3. Assign Administrator Privileges & Seed Initial Catalog

Generate a Firebase Service Account JSON key from **Project Settings → Service Accounts → Generate new private key**.

Set environment variables locally in `.env.local` (copied from `.env.example`), then run:

```bash
# 1. Assign server-side `admin: true` custom claim + `users/{uid}` role
npm run set-admin -- vishnumj112004@gmail.com "MJ Studio Admin"

# 2. Seed initial 10 categories, featured plates, 3 stories, and site settings
npm run seed
```

---

## 4. Vercel Deployment

1. Push the repository to GitHub (`.env.local` is ignored via `.gitignore`).
2. Import the repository into Vercel.
3. Configure **Environment Variables** in Vercel Project Settings:
   - **Client (`NEXT_PUBLIC_*`)**:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`
     - `NEXT_PUBLIC_SITE_URL` (`https://your-domain.com`)
   - **Server-Only (NEVER prefix with `NEXT_PUBLIC_`)**:
     - `FIREBASE_SERVICE_ACCOUNT_KEY` (or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
     - `FIREBASE_STORAGE_BUCKET`
     - `ENFORCE_APP_CHECK=true`
     - `BOOKING_NOTIFICATION_WEBHOOK_URL` (optional webhook for instant booking alerts)
4. Deploy and verify:
   - Test public gallery filtering, lightbox navigation, and 3D exhibition pavilion.
   - Submit a test enquiry on `/contact` and confirm it appears in Firestore `bookings` and `/admin`.
   - Sign in at `/admin/login` using your provisioned admin email and confirm a non-admin Firebase user is rejected with `403`.

