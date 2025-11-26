FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first (leveraging cached layers)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files and build
COPY tsconfig.json ./
COPY src ./src
COPY README.md LICENSE ./
RUN npm run build

# -------- Runtime image --------
FROM node:20-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/README.md ./README.md
COPY --from=builder /app/LICENSE ./LICENSE

# Install production dependencies only
RUN npm ci --omit=dev

# Default configuration (Smithery can override via env)
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/httpServer.js"]

