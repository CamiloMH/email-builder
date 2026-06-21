# syntax=docker/dockerfile:1

# --- Build stage: install the workspace and build the backend + its deps ---
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @email/backend... build
# Produce a self-contained production bundle (backend + workspace deps).
RUN pnpm --filter @email/backend deploy --prod --legacy /app

# --- Runtime stage: minimal image with only the production bundle ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3005
CMD ["node", "dist/main.js"]
