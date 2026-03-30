FROM node:20-alpine

WORKDIR /app

COPY . .

# All files land in /app/TempleGym/ — switch into it
WORKDIR /app/TempleGym

RUN npm install --legacy-peer-deps

RUN cd apps/server && npx prisma generate && npm run build && ls -la dist/

EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]
