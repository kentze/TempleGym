FROM node:20-alpine

WORKDIR /app

# Copy entire repo (dockerignore excludes heavy/unnecessary stuff)
COPY . .

# Install all workspace dependencies from root
RUN npm install --legacy-peer-deps

# Generate Prisma client and build server
RUN cd apps/server && npx prisma generate && npm run build

EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]
