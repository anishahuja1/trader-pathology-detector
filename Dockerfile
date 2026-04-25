# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .

# Set dummy URL for generation
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install openssl for Prisma runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Initialize database during image build
ENV DATABASE_URL="file:/app/prisma/dev.db"
RUN npx prisma db push --accept-data-loss
RUN npx prisma db seed

EXPOSE 4010

# Start server
CMD ["npm", "start"]
