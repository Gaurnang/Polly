# Use Node.js LTS image
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]