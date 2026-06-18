FROM node:18-alpine
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Create uploads directory for image staging (used by Multer)
RUN mkdir -p uploads && chmod 777 uploads

EXPOSE 5000
CMD ["node", "server.js"]
