FROM node:20-alpine

WORKDIR /app

# Copy backend package files first (better caching)
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev || npm install --omit=dev

# Copy backend source + root db sql files
COPY backend ./backend
COPY db ./db

EXPOSE 4000

# Run migrations + seed then start server
CMD ["sh", "-c", "node backend/db/migrate.js && node backend/db/seed.js && node backend/src/server.js"]
