FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV VITE_API_BASE_URL=http://localhost:8080
ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
