FROM node:22-alpine AS webbuild
WORKDIR /build/web
COPY web/package*.json ./
RUN npm install --no-audit --no-fund
COPY web ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY api/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY api/src ./src
COPY --from=webbuild /build/web/dist ./public
RUN mkdir -p /app/storage && chown -R node:node /app
USER node
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
