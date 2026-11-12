# Agentic OS Command Center — portability build (PLAN.md: Docker optional for v1).
# The web app runs fully; conductor runs additionally need the claude CLI on PATH
# with subscription auth — mount ~/.claude and a claude binary, or bake your own
# derived image. Vault and app-state db are volumes.
#
# Build:  docker build -t agentic-os .
# Run:    docker run -p 3000:3000 \
#           -v $VAULT_ROOT:/vault \
#           -v agentic-os-data:/data \
#           -e VAULT_ROOT=/vault -e APP_DB_PATH=/data/app.db \
#           --env-file .env.local agentic-os

FROM node:22-slim AS deps
WORKDIR /app
# better-sqlite3 is a native module — build it for the container platform
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# registry seed + persona prompts are runtime data, not traced by standalone
COPY --from=build /app/data/workflows.seed.json ./data/workflows.seed.json
COPY --from=build /app/data/personas ./data/personas
EXPOSE 3000
CMD ["node", "server.js"]
