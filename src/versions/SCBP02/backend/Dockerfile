FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

COPY backend ./backend

EXPOSE 5000

CMD ["node", "backend/server.js"]
