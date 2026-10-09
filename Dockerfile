# Multi-stage Dockerfile for Buildora
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install

# Copy source and build frontend
COPY client/ ./client/
COPY server/ ./server/
RUN npm run build -w client

# Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --omit=dev --workspace=server

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

ENV PORT=5000
EXPOSE 5000

CMD ["node", "server/src/server.js"]
