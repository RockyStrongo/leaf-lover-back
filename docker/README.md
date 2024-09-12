### **Build the Docker image**

From the root folder:  

`docker build -t leaf_lover_api . -f ./docker/Dockerfile`

### **Run the container**

`docker run -e PORT=5000 -e API_VERSION="v1" -e DATABASE_URL="postgresql://<user>:<password>@localhost:5432/dbname?schema=public" -e PLANT_API_HOST="https://perenual.com" -e PLANT_API_KEY="loremipsum" -e COOKIE_SECRET="loremipsum" -e JWT_SECRET="loremipsum" -e FRONT_DOMAIN_URL="https://example.com" -e COOKIE_DOMAIN=".example.com" -e EMAIL_USER="example@example.com" -e EMAIL_PASSWORD="loremipsum" -e EMAIL_SERVICE="loremipsum" -e RATE_LIMITING_REQUESTS=100 -e SESSION_SECRET="loremipsum" -p 5050:5000 leaf_lover_api`