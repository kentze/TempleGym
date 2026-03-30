FROM node:20-alpine

WORKDIR /app

COPY . .

# All files land in /app/TempleGym/ — switch into it
WORKDIR /app/TempleGym

RUN npm install --legacy-peer-deps

RUN cd apps/server && npx prisma generate && npm run build

RUN find /app/TempleGym/apps/server/dist -name "*.js" | head -20

EXPOSE 3000

CMD ["node", "/app/TempleGym/apps/server/dist/index.js"]
