# Simple Variable Service

This service offers users easy remote access to JSON like data that can be accessed via a simple web request. Users can create simple values like strings, integers, floats, booleans, and lists.  An authenticated user is able to freely Create, Read, Update, and Remove as many variables as they please.  If a user wants to be able to share their variables they can either select specific users to have specific capabilities towards one or more variables, or make their variable publicly accessible to anyone.

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

Requests can be made to the configured PORT specified in your environment variables.

## Contributors
