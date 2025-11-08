# Frontend multi-stage Dockerfile
# Stage 1: build the static site using Node
FROM node:18-alpine AS builder
WORKDIR /app

# Install production/dev deps needed for the build (tailwind/postcss/terser etc.)
COPY package*.json ./
RUN npm ci --silent

# Copy source and run build script which outputs to ./dist
COPY . .
RUN npm run build

# Stage 2: serve the built static files with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
