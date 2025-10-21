# Build frontend
FROM node:18-alpine AS frontend-build

# Set working directory
WORKDIR /app

# Define build arguments for Vite environment variables
ARG VITE_APP_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Set environment variables for the build
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Copy package files
COPY photure-fe/package.json photure-fe/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY photure-fe/ .

# Build the application
RUN npm run build

# Nginx stage
FROM nginx:alpine

# Copy built frontend files
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
