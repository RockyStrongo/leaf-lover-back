# Stage 1: Build the application
FROM node:20.6.1-alpine3.18 AS build

# Define env variables
ENV PORT=1234
ENV API_VERSION="v1"
ENV DATABASE_URL="postgresql://<user>:<password>@localhost:5432/dbname?schema=public"
ENV PLANT_API_HOST="https://perenual.com"
ENV PLANT_API_KEY="loremipsum"
ENV COOKIE_SECRET="loremipsum"
ENV JWT_SECRET="loremipsum"
ENV FRONT_DOMAIN_URL="https://example.com"
ENV COOKIE_DOMAIN=".example.com"
ENV EMAIL_USER="example@example.com"
ENV EMAIL_PASSWORD="loremipsum"
ENV EMAIL_SERVICE="loremipsum"
ENV RATE_LIMITING_REQUESTS=100
ENV SESSION_SECRET="loremipsum"

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