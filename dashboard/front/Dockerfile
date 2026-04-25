# -- Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# -- Serve stage - nginx serves the static files
# -- Caddy handles SSL and routing externally
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# -- SPA config: all routes fall back to index.html so React Router works
COPY nginx.conf /etc/nginx/conf.d/default.conf
