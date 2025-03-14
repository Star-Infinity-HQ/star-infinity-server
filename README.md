<div align="center">
  <img src="docs/assets/star-infinity-logo.png" alt="Star Infinity Logo" width="150" height="150"/>
</div>

# Star Infinity Server

[![Express](https://img.shields.io/badge/-Express-black?style=flat&logo=express&logoColor=white)]()
[![Node.js](https://img.shields.io/badge/-Node.js-black?style=flat&logo=node.js&logoColor=339933)]()
[![JavaScript](https://img.shields.io/badge/-JavaScript-black?style=flat&logo=javascript&logoColor=F7DF1E)]()
[![Prisma](https://img.shields.io/badge/-Prisma-black?style=flat&logo=prisma&logoColor=FFFFFF)]()
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-black?style=flat&logo=postgresql)]()
[![Winston](https://img.shields.io/badge/-Winston-black?style=flat&logo=winston&logoColor=339933)]()
[![Arcjet](https://img.shields.io/badge/-Arcjet-black?style=flat&logo=arcjet&logoColor=339933)]()
[![Docker](https://img.shields.io/badge/-Docker-black?style=flat&logo=docker)]()
[![Auth.js](https://img.shields.io/badge/-Auth.js-black?style=flat&logo=authjs)]()
[![GraphQL](https://img.shields.io/badge/-GraphQL-black?style=flat&logo=graphql&logoColor=e535ab)]()

> [!WARNING]
> This project is currently under development. To ensure a smooth experience, we recommend using this project only for development and testing purposes before moving it to production servers.

## Table of Contents

- [Star Infinity Server](#star-infinity-server)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Configuration](#configuration)
  - [Branching Strategy and Workflow](#branching-strategy-and-workflow)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

Star Infinity Server is a robust API server built to handle requests from the Star Infinity client and other services. Built with Express.js for the API backend and Prisma ORM for database interactions, the application offers a scalable foundation for your space exploration platform.

## Project Structure

The project is structured as follows:

1. **Server** - Express.js server application
   - RESTful API endpoints for client communication
   - Prisma ORM for database interactions
   - PostgreSQL database for data persistence
   - Winston for comprehensive logging
   - Arcjet for API security and rate limiting

The server architecture is organized into the following components:
- `config`: Configuration files for server settings
- `helpers`: Utility functions for common tasks
- `middleware`: Express middleware for request handling
- `resolvers`: Resolver functions for data queries
- `schema`: Database schema definitions
- `typedefs`: Type definitions for API endpoints
- `utils`: Utility functions for server operations

## Getting Started

In order to get started with this project, you will need to have the following software installed on your machine:
1. [Node.js](https://nodejs.org/en/) - Latest LTS Version
2. [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) - Package manager
3. [PostgreSQL](https://www.postgresql.org/download/) - Database

### Installation

To get started with the project, follow the steps below:
1. Clone the repository to your local machine using the following command:
```bash
git clone https://github.com/Star-Infinity-HQ/star-infinity-server.git
```

2. After cloning the repository, navigate to the project directory:
```bash
cd star-infinity-server
```
   
3. Install the required dependencies:
```bash
npm install
# or
yarn install
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. You will now be able to access the API server at `http://localhost:3000`.

### Configuration

Most of the configuration for the project is done through environment variables. The following files need to be configured:

Server `.env.sample` file:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/star_infinity?schema=public"

# Logging Configuration
LOG_LEVEL=info

# Arcjet Configuration
ARCJET_KEY=your_arcjet_key
```

Create a `.env` file based on the sample file and set the values for each variable.

## Branching Strategy and Workflow

For our branching strategy, each branch should be named after a feature, bug fix, or improvement with its corresponding identifier. For example, if you are working on a new feature, your branch name should be appropriately named `feature/user-authentication`. Other examples include:
- `feature/...` - For branches related to a feature or improvement
- `bugfix/...` - For branches related to a bug fix
- `refactor/...` - For branches related to code refactoring or cleanup
- `docs/...` - For branches related to documentation improvements
- `chore/...` - For branches related to maintenance tasks

This branching strategy is crucial for our project's smooth development and is **ENCOURAGED** to be followed by all contributors.

## Contributing

We welcome all types of contributions to this project. Please refer to our [CONTRIBUTING.md](docs/CONTRIBUTING.md) file for guidelines on how to contribute.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
