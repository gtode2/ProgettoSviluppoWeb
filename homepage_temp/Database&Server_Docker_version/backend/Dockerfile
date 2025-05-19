# Base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Expose application port
EXPOSE 3000

# Default command
CMD ["node", "server.js"]
