# Bun Dockerfile for Railway
FROM oven/bun:latest
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

# If you have a build step (e.g., TypeScript), uncomment:
# RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "app/server.ts"]
