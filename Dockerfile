# Use Node.js LTS as the base image
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Set a dummy DATABASE_URL for the build step
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-slim AS runner

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create the SQLite database file and seed it
ENV DATABASE_URL="file:/app/prisma/dev.db"
RUN npx prisma db push --accept-data-loss
RUN npx prisma db seed

EXPOSE 4010

# Start the application
CMD ["npm", "start"]
