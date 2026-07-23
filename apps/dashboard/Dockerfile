# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Production stage (serve build artifacts)
FROM nginx:stable-alpine

# Copy built HTML/JS/CSS assets to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
