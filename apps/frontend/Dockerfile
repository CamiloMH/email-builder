# syntax=docker/dockerfile:1

# --- Build stage: build the static SPA ---
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /repo
# API base URL is baked at build time.
ARG VITE_API_URL=http://localhost:3005
ENV VITE_API_URL=$VITE_API_URL
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @email/frontend build

# --- Runtime stage: serve the static files with nginx ---
FROM nginx:alpine AS runner
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
