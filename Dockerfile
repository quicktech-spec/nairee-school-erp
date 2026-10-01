# Multi-stage Dockerfile for Nairee School Management ERP
FROM node:20-alpine AS builder

WORKDIR /app

# Copy web files and build production frontend
COPY web/package*.json ./web/
RUN cd web && npm install

COPY web/ ./web/
RUN cd web && npm run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Install native dependencies for sqlite3 rebuild if needed
RUN apk add --no-cache python3 make g++

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source code and seed database
COPY backend/ ./backend/

# Copy built frontend dist from builder stage
COPY --from=builder /app/web/dist ./web/dist

# Create uploads directory and ensure permissions
RUN mkdir -p /app/backend/uploads /app/backend/data

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start server
CMD ["node", "backend/src/server.js"]
