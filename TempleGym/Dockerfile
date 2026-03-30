FROM node:20-alpine

WORKDIR /app

# Copy monorepo root files
COPY package.json package-lock.json ./
COPY packages/ ./packages/

# Copy server source
COPY apps/server/ ./apps/server/

# Install all workspace dependencies from root
RUN npm install --legacy-peer-deps

# Generate Prisma client and build server
RUN cd apps/server && npx prisma generate && npm run build

EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]
