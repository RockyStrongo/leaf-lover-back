## install the project (dev)

1. create a postgreSQL database 

example docker command : 
```
docker run -itd -e POSTGRES_USER=<user> -e POSTGRES_PASSWORD=<password> -e POSTGRES_DB=leafloverdb -p 5432:5432 --name leaflovedb postgres
```

2.  create .env from .env.example and add the necessary info

for db created in example above : 
```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/leafloverdb?schema=public"
```

3.   install dependencies
```
npm install
```
4. run migrations

```
npx prisma migrate dev
```

5. seed the database

```
npx prisma db seed
```

6. start the project (dev mode)

```
npm run dev
```

windows :
 ```
npm run dev-windows
```

## Start the project (prod mode)
1. build

```
npm run build
```

2. start

```
npm start
```

## Use Prisma UI for DB

```
npx prisma studio
```

## Generate new JSON static data for database seed

1. open prisma/seed/generateImportData.ts and specify the ID range you want to fetch fro the external API

2. run

```
npx ts-node prisma/seed/generateImportData.ts 
```
It will generate data from the external API to /seed/data/plantsSeedData{timestamp}.json

3. seed the database
```
npx prisma db seed
```
this command will insert in the DB the data from files in prisma/seed/data/

## Error: P1001: Can't reach database server

* Vérifier si le port est déjà utilisé ( sous windows ) :
```
netstat -ano | findstr :5432
```

* Si déjà occupé, alors le kill en lançait CMD en admin et en renseignant le pid
```
taskkill /PID <pid> /F