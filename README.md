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
expo-location GPS access to verify the user is physically at the gym
expo-secure-store, to securely stores the JWT on the device (encrypted native storage)

### Backend (`apps/server`)
Prisma used for ORM for defining the database schema and querying PostgreSQL
PostgreSQL for relational database storing users, workouts, and points

## APIs & Services
Expo Location AP, used for requests foreground GPS permission and retrieves device coordinates
