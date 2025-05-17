# Dockerfile
FROM node:20-alpine

# 1) install prod dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# 2) copy the rest of the source
COPY . .

# 3) container listens on 3000
EXPOSE 3000

# 4) start the API
CMD ["node", "server.js"]
