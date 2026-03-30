FROM node:20-alpine

WORKDIR /app

COPY . .

# Install ALL deps including devDependencies (needed for TypeScript compiler)
WORKDIR /app/TempleGym
RUN NODE_ENV=development npm install --legacy-peer-deps

# Build server
WORKDIR /app/TempleGym/apps/server
RUN npx prisma generate
RUN npm run build
RUN ls -la dist/ && test -f dist/index.js || (echo "ERROR: dist/index.js not produced by tsc" && exit 1)

EXPOSE 3000

CMD ["node", "dist/index.js"]
