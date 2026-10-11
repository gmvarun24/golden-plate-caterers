# Golden Plate Caterers — production image (single VPS deployment).
# Build:  docker build -t golden-plate .
# Run:    see docker-compose.prod.yml

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Dependencies ──
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ── Build ──
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
# Build-time values only (runtime secrets come from the environment at `docker run`).
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_GA4_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID
# Pages are prerendered from the database at build time when one is reachable; otherwise
# they render on first request. A placeholder secret keeps env validation happy.
ARG DATABASE_URL=postgres://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL PAYLOAD_SECRET=build-time-placeholder-secret
RUN npm run build

# ── Runtime ──
FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Fonts for Open Graph images, migrations + CLI for `npm run migrate`
COPY --from=builder /app/node_modules/@fontsource ./node_modules/@fontsource
COPY --from=builder /app/src/migrations ./src/migrations
RUN mkdir -p media && chown nextjs:nodejs media
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
