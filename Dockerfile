FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# schema.prisma needs: binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
# requires output: 'standalone' in next.config.js
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
# custom output path from schema.prisma: output = "../app/generated/prisma"
COPY --from=build /app/app/generated/prisma ./app/generated/prisma
# prisma CLI itself, needed to run migrate deploy at boot without hitting the network
COPY --from=build /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "set -a; . /run/secrets/env_prod; set +a; npx prisma migrate deploy && exec node server.js"]
