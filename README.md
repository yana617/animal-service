# Animal service for house-of-souls-ui

### To run tests
```
npm run test:docker
```

### To run
```
docker compose up --build
```

### Create migration
```
// required run once!
npm i -g typeorm

// You should have running local database
// START postgres and create user (.env)
// psql postgres
// CREATE DATABASE with name from *.env*;

npm run typeorm -- migration:generate ./src/migrations/my-migration-name

// confirm that all correct & run migrations
// test down() works correctly!
```

### Updating swagger
Add new swagger path or schema files in **documentation/** folder

Then run
```
npm install -g swagger-cli
swagger-cli bundle documentation/swagger.yaml --outfile swagger.yaml --type yaml
```

You can run `npm run dev` and see swagger UI [via this url](http://localhost:1083/docs/)

### To 
```
docker compose up --build
```