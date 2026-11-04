# Multi-stage build for NestJS backend
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install build dependencies for bcrypt native module
RUN apk add --no-cache python3 make g++

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/static ./static
COPY --from=builder /app/src/views ./views

# Rebuild bcrypt for Alpine Linux
RUN npm rebuild bcrypt --build-from-source

# Set ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

ENV PORT=4000

CMD ["node", "dist/main"]
