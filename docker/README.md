### **Build the Docker image**

From the root folder:  

`docker build -d -t leaf_lover_api . -f ./docker/Dockerfile`

### **Run the container**

`docker run -p 3000:3000 leaf_lover_api`