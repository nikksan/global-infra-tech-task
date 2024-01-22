# News API

## Summary

Minimalistic service providing REST for news entity.

## Setup

### Configure local environment variables

- Execute `cp .env.sample .env` in the project root directory

### Start the server

- Execute `docker compose up --build`

## Setup (tests)

### Configure local environment variables

- Execute `cp .env.sample .env` in the project root directory

### Run the tests

- Execute `docker compose -f docker-compose.test.yaml up --build`


## Environment setup

Current working environment could be changed by setting `NODE_ENV` environment variable. Available options are `development` (default), `testing`, `staging` and `production`.

## Configuration

Configuration options could be provided by either setting them as environment variables, when the server is run or by putting
them in the `.env` file. Following options are supported:

* `LOG_LEVEL` - log level at which messages should be logged. Following log levels are supported.
  (in priority order, lowest to highest): `error`, `warn`, `info`, `debug`
* `REST_SERVER_PORT` - Port where rest server starts at. Defaults to `3000`
* `GRPC_SERVER_PORT` - Port where grpc server starts at. Defaults to `3001`
* `GRPC_SERVER_HOST` - Host where grpc server starts at. Defaults to `localhost`
* `MONGO_USER` - self-explanatory
* `MONGO_PASS` - self-explanatory
* `MONGO_DB` - self-explanatory
* `MONGO_HOST` - self-explanatory
* `MONGO_PORT` - self-explanatory
* `MONGO_AUTH_SOURCE` - name of the database that has the collection with the user credentials. Defaults to `admin`

## API Docs

API documentation is written in OpenAPI 3.0 format and resides within `docs/` directory. It could be accessed via `/docs` endpoint.
