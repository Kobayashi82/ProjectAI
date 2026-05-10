FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy SSH private key from builder stage into runtime image
COPY --from=builder /app/privatekey ./privatekey
RUN chmod 600 ./privatekey || true

CMD ["node", "dist/index.js"]
