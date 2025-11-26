FROM node:20-slim AS builder

WORKDIR /app

# Configure npm for more robust installs (network retries, explicit registry)
RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 5000 \
  && npm config set fetch-retry-maxtimeout 60000

# Install dependencies first (leveraging cached layers). Skip lifecycle scripts to avoid running prepare before sources are copied.
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

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

# Install production dependencies only (skip scripts; build already done)
RUN npm install --omit=dev --ignore-scripts

# Default configuration (Smithery can override via env)
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/httpServer.js"]

