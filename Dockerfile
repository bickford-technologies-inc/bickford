# Bun Dockerfile for Railway or Fly.io
FROM oven/bun:latest
WORKDIR /app

# Install pnpm globally
RUN bun add -g pnpm

COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "app/server.ts"]
