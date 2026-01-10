# backend/Dockerfile
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Install deps with caching
COPY package.json ./
RUN npm install --omit=dev

COPY server.js db.js ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
