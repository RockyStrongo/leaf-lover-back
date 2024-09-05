# Stage 1: Build the application
FROM node:20.6.1-alpine3.18 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

# Stage 2: Create a smaller production image
FROM node:20.6.1-alpine3.18
WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist/
COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=build /app/.env .env
RUN npm install --production
EXPOSE 5000
CMD ["npm", "start"]