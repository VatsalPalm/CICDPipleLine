# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy root dependency manifests
COPY package.json yarn.lock ./

# Copy workspace package manifests
COPY apps/dashboard/package.json ./apps/dashboard/
COPY services/pipeline-service/package.json ./services/pipeline-service/
COPY services/sonar-service/package.json ./services/sonar-service/
COPY services/secrets-service/package.json ./services/secrets-service/

# Install dependencies for all workspaces
RUN yarn install --frozen-lockfile

# Copy all source files
COPY . .

# Build dashboard package
RUN yarn workspace @flowops/dashboard build

# Production stage (serve build artifacts)
FROM nginx:stable-alpine

# Copy built HTML/JS/CSS assets to Nginx html folder
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
