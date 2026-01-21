FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package.json ./package.json
RUN npm install

COPY backend/src ./src
COPY backend/db ./db
COPY db /app/db

EXPOSE 4000

CMD ["npm", "run", "dev"]
