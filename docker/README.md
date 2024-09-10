### **Build the Docker image**

From the root folder:  

`docker build -t leaf_lover_api . -f ./docker/Dockerfile`

### **Run the container**

`docker run -p 5000:5000 leaf_lover_api`
