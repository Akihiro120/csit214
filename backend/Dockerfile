# Use an official Node.js runtime as a parent image
# Using Alpine for a smaller image size
FROM node:23-alpine

# Set the working directory in the container
WORKDIR /app

# Install Python, build tools, and PostgreSQL dev libraries needed for some npm packages
# hadolint ignore=DL3018
RUN apk add --no-cache python3 make g++ postgresql-dev

# Copy package.json and package-lock.json (if available)
# Copying these first leverages Docker layer caching
COPY package*.json ./

# Install app dependencies
# Using 'npm ci' is generally recommended for CI/CD and production builds
# as it installs exact versions from package-lock.json and is faster.
# Use '--only=production' if you don't need devDependencies in the final image.
RUN npm ci

# Optional: Remove build dependencies after installation to keep image smaller
# RUN apk del python3 make g++ postgresql-dev

# Bundle app source
COPY . .

# Your app listens on port 3000 according to backend/src/index.js
# Expose this port from the container
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "src/index.js" ]