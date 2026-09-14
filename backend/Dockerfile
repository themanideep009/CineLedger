# Production Dockerfile for CineLedger Backend API Server
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose HTTP API Port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start command
CMD ["npm", "start"]
