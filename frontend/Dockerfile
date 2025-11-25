# Frontend multi-stage Dockerfile
# Stage 1: build the static site using Node
FROM node:18-alpine AS builder
WORKDIR /app

# Install production/dev deps needed for the build (tailwind/postcss/terser etc.)
COPY package*.json ./
# Show npm output to capture detailed errors during image build
# Use `npm install` here because package-lock.json and package.json
# in the repo are out-of-sync. `npm install` will compute deps from
# package.json and produce a working node_modules for the build.
RUN npm install --no-audit --no-fund

# Copy source and run build script which outputs to ./dist
COPY . .
RUN npm run build

# Stage 2: serve the built static files with nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/robots.txt /usr/share/nginx/html/robots.txt
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
