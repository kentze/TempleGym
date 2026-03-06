# TempleGym
A mobile app for Temple University Japan (TUJ) students to log workouts at the Owl Center gym, earn points, and compete on a weekly leaderboard.

## Programming Languages
TypeScript, used for Entire codebase — mobile app, backend server, and shared types
SQL, used for Raw PostgreSQL queries for leaderboard volume score calculation

## Frameworks
React Native, used for Cross-platform mobile UI (iOS & Android)
Expo (SDK 51) part of React Native toolchain — handles builds, device APIs, and development server
Express.js, used for backend REST API server (Node.js)


## Libraries

### Mobile (`apps/mobile`)
React Navigation, used for Screen navigation and stack management
Zustand, used for Lightweight global state management (auth token, user profile)
Axios HTTP client for communicating with the backend API
expo-location GPS access to verify the user is physically at the gym
expo-secure-store, to securely stores the JWT on the device (encrypted native storage)

### Backend (`apps/server`)
Prisma used for ORM for defining the database schema and querying PostgreSQL
PostgreSQL for relational database storing users, workouts, and points
JSON Web Token (jsonwebtoken)** | Issues and verifies JWTs for authenticated sessions
Nodemailer** | Sends OTP verification emails via SMTP
Zod** | Runtime input validation and schema enforcement on API requests
node-cron** | Schedules the weekly leaderboard bonus (runs every Sunday at 23:59 JST)
date-fns / date-fns-tz** | Date arithmetic and Asia/Tokyo timezone handling


## APIs & Services
Expo Location AP, used for requests foreground GPS permission and retrieves device coordinates
SMTP (email) Delivers one-time password (OTP) codes to `@temple.edu` addresses for login
REST API (custom) The Express backend exposes its own JSON REST API consumed by the mobile app

### REST API Endpoints
| `POST` | `/auth/request-otp` | Send a 6-digit OTP to a Temple email address
| `POST` | `/auth/verify-otp` | Verify the OTP and receive a JWT
| `GET` | `/me` | Get the logged-in user's profile and points
| `PATCH` | `/me/profile` | Update display name, height, and weight
| `POST` | `/workouts` | Submit a completed workout session
| `GET` | `/leaderboard/weekly` | Get the top 100 users ranked by weekly volume score
