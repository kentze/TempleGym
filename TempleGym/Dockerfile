FROM node:20-slim

WORKDIR /app

COPY . .

# Install ALL deps including devDependencies (needed for TypeScript compiler)
WORKDIR /app/TempleGym
RUN NODE_ENV=development npm install --legacy-peer-deps

# Build server
WORKDIR /app/TempleGym/apps/server
RUN npx prisma generate
RUN npm run build
EXPOSE 3000

CMD ["node", "dist/src/index.js"]
