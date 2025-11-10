# Stage 1: Build Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Use legacy peer deps to avoid dependency conflicts
RUN npm install --legacy-peer-deps --frozen-lockfile

# Copy the rest of the files
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Run Next.js in production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Next.js listens on port 3000
EXPOSE 3000

CMD ["npm", "start"]
