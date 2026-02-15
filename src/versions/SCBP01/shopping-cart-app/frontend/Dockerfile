FROM node:20-alpine

WORKDIR /app

# Copy frontend package files first
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install

# Copy frontend source
COPY frontend ./frontend

# Allow build-time API url for Vite
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

EXPOSE 5173

CMD ["sh", "-c", "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"]
