# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept API URL as build argument
ARG REACT_APP_API_URL=https://autism-api.farhanage.site
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
