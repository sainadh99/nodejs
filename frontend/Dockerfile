# Stage 1 - Build
FROM node:18 AS build
WORKDIR /app
COPY .env . 
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Serve 
FROM node:18-slim
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build"]
