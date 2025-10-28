FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm test

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/package*.json ./
RUN npm ci --omit=dev
COPY src ./src
EXPOSE 3000
CMD ["npm","start"]
