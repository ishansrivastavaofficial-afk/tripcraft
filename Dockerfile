# Use a lightweight, official Node.js runtime image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --only=production

# Copy the rest of the application source code (server.js, public folder, etc.)
COPY . .

# Expose the port that your Express backend listens on
EXPOSE 8080

# Command to start your application server
CMD ["node", "server.js"]