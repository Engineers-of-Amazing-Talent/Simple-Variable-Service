# Simple Variable Service

![CI](https://github.com/Engineers-of-Amazing-Talent/Simple-Variable-Service/actions/workflows/ci.yaml/badge.svg)

This service offers users easy remote access to JSON like data that can be accessed via a simple web request. Users can create simple values like strings, integers, floats, booleans, and lists.  An authenticated user is able to freely Create, Read, Update, and Remove as many variables as they please.  If a user wants to be able to share their variables they can either select specific users to have specific capabilities towards one or more variables, or make their variable publicly accessible to anyone.

[System Architecture](./docs/architecture.md)

## Installation

SVS uses docker to compose the Application running Node v18.X, as well as a PostgreSQL instance v.13.  You will need NodeJS and Docker installed in order to build and run the application.

1. Clone Repository.

    ```bash
    git clone https://github.com/Engineers-of-Amazing-Talent/Simple-Variable-Service.git
    ```

1. Configure your environment variables.

    ```bash
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB=mydatabase
    POSTGRES_HOST=db
    NODE_ENV=development
    APP_PORT=3000
    DB_PORT=5432
    ```

1. Install with Docker Compose.

    ```bash
    cd Simple-Variable-Service
    docker-compose up --build
    ```

## Usage

Once the project is installed it can be started locally in a development environment with docker compose:

```bash
docker-compose up
```

To run the project in your local node environment you will want to install the project dependencies via npm:

```bash
npm install
npm run build
npm start
```

### Testing

Tests are configured to be run in your local node environment.  After installing via npm, you can run the test scripts:

```bash
npm test
```

### Base URL

The base URL for all API requests is:

```arduino
https://simple-variable-service.onrender.com/
```

### Authentication

This feature is in progress:

```makefile
Authorization: Bearer YOUR_ACCESS_KEY
```

### Endpoints

#### 1. Create a Variable

Endpoint: `POST api/v1/variable`  
Description: Create a single new Variable resource.

##### Request

```json
{
    "type": "STRING" | "INTEGER" | "FLOAT" | "BOOLEAN" | "LIST",
    "key": "My Key",
    "value": "My Value"
}
```

##### Response

```json
{
    "resourceId": "your-resource-id"
}
```

##### Status Codes

* `201 CREATED` - Successfully create a variable.
* `401 unauthorized` - Authentication failure.

#### 2. Read a Variable

Endpoint: GET /variable/{id}  
Description: Retrieves a single resource by its ID.

##### Request

```bash
GET api/v1/variable/{id}
```

##### Response

```json
{
  "data": "variable value",
}
```

##### Status Codes

* `200 OK` - Successfully retrieved the resource.
* `401 Unauthorized` - Authentication failed.
* `404 Not Found` - Resource not found.

## Contributors
