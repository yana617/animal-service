docker-compose up -d postgres-db-animal-service-test

WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 1; done;"
docker-compose exec postgres-db-animal-service-test -c "$WAIT_FOR_PG_ISREADY"

export POSTGRES_USERNAME=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_PORT=5435
export POSTGRES_DB=test-db

npx typeorm-ts-node-commonjs migration:run -d src/database/index.ts

echo "start running tests"
jest --coverage --runInBand
echo "tearing down all containers"

docker-compose stop
