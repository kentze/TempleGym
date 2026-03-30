FROM node:20-alpine

WORKDIR /app

COPY . .

# Install from monorepo root to resolve workspace packages
WORKDIR /app/TempleGym
RUN npm install --legacy-peer-deps

# Build server from its own directory
WORKDIR /app/TempleGym/apps/server
RUN npx prisma generate && npm run build

# Verify output exists
RUN ls -la dist/

EXPOSE 3000

CMD ["node", "dist/index.js"]
