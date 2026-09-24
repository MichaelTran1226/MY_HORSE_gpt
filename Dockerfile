FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/tsconfig.json backend/nest-cli.json ./
COPY backend/src ./src
RUN npm run build
COPY backend/scripts ./scripts
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY --from=build --chown=node:node /app/backend/package*.json ./
COPY --from=build --chown=node:node /app/backend/node_modules ./node_modules
COPY --from=build --chown=node:node /app/backend/prisma ./prisma
COPY --from=build --chown=node:node /app/backend/dist ./dist
COPY --from=build --chown=node:node /app/backend/scripts ./scripts
COPY --from=build --chown=node:node /app/frontend/dist /app/frontend/dist
USER node
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

