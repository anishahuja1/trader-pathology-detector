# Use Node.js LTS as the base image
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4010

# Start the application
CMD ["npm", "start"]
