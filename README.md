# BBMh Business Hub — Complete CRM

Premium internal CRM for BBMh Media House. Built with React, TypeScript, and Supabase.

## 🚀 Getting Started

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com) named `bbmh-business-hub`.
2. Open the **SQL Editor** and paste the contents of `supabase_schema.sql` located in the root of this project. Click **Run**.
3. Go to **Storage** -> **New Bucket**. Name it `assets` and toggle **Public** to ON.
4. (Optional) Run the storage policies at the bottom of `supabase_schema.sql` if you encounter permission issues.

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
You can find these in the Supabase Dashboard under **Settings** -> **API**.

### 3. Installation
```bash
npm install
npm run dev
```

## 🛠 Tech Stack
- **Framework**: React + Vite + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **Styling**: Vanilla CSS + Utility Classes (CLS)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## 📖 Lessons Applied
- SQL Schema runs on Day 1.
- RLS disabled for single-team internal use.
- Public Storage buckets for assets.
- Explicit Supabase calls on every save.
- Route-based navigation.
