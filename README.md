# AI-Powered Form Generator

Generate and share dynamic forms from natural language prompts using Google Gemini (with fallbacks to OpenRouter/Groq), collect submissions, and support image uploads via Cloudinary.

## Tech Stack
- Frontend: Next.js 15 (app router) + TypeScript + Tailwind
- Backend: Express + MongoDB (Atlas) + JWT auth
- AI: Google Gemini API (or OpenRouter/Groq)
- File Uploads: Cloudinary

## Features
- Email/password auth (signup/login) storing JWT in `localStorage`
- AI Form Generator: Prompt → JSON schema → preview → save
- Public form links: Render a dynamic form at `/form/[id]`
- Submissions: Save all responses, view them in dashboard
- Image uploads: Supported in generator preview and public forms via Cloudinary
- Basic validation and loading states

## Local Setup

1. Clone or open this project.

2. Backend env:
   - Copy `server/.env.example` to `server/.env` and set:
     - `MONGODB_URI` (Atlas or local)
     - `JWT_SECRET`
     - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
     - One of `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, or `GROQ_API_KEY`

3. Frontend env:
   - Copy `web/.env.local.example` to `web/.env.local` and set:
     - `NEXT_PUBLIC_API_URL=http://localhost:4000`

4. Install deps:
   - Backend: `cd server && npm install`
   - Frontend: `cd web && npm install`

5. Run dev:
   - Backend: `cd server && npm run dev` → `http://localhost:4000`
   - Frontend: `cd web && npm run dev` → `http://localhost:3000` (or `3001` if in use)

## Example Prompt
> "I need a signup form with name, email, age, and profile picture."

The AI returns a schema with fields like text, email, number, and image. You can preview the form, upload an image (stored on Cloudinary), and save the schema. Share the public link `/form/[id]` to collect responses.

## How It Works
- Auth: `/auth/signup`, `/auth/login` (JWT). Frontend stores token in `localStorage`.
- Generate schema: `/ai/generate-schema` (uses Gemini → OpenRouter → Groq fallback with validation and a minimal default if all fail).
- Forms: `/forms` (list/create for user), `/forms/:id` (public schema by `publicId`).
- Submissions: Public POST `/forms/:id/submissions`; Owner GET `/forms/:id/submissions`.
- Uploads: `/upload` (multipart image) → Cloudinary URL returned and stored in submission payload.

## Project Structure
```
server/
  index.js
  src/{routes,models,utils,middleware,config}
web/
  src/app/{signup,login,dashboard,generator,form/[id]}
  src/components/FormRenderer.tsx
  src/lib/{api,auth}.ts
```

## Limitations & Future Improvements
- No email verification or password reset (basic auth only).
- CORS is permissive for local dev; restrict in production.
- Minimal validation; add schema-driven constraints per field.
- Add role-based access, rate limiting, and better error UX.
- Deploy scripts for Vercel/Render and environment configuration.

## Deployment Notes
- Backend: Deploy to Render/Fly/Heroku; set env vars.
- Frontend: Deploy to Vercel; set `NEXT_PUBLIC_API_URL` to the backend URL.
- MongoDB Atlas is recommended; secure IP access and credentials.

## Repository
Push this folder to GitHub and share the link. Example:
```
git init
git add .
git commit -m "AI form generator initial"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```