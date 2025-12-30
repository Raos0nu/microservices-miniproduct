# Microservices-Based Mini Product

## Tech Stack
- Node.js + Express
- Docker + Docker Compose
- PostgreSQL (database per service)
- GitHub Actions (CI/CD)
- http-proxy-middleware (API Gateway)

## Features
- 3 independent microservices (Auth, User, Order)
- API Gateway for centralized routing
- Inter-service communication (HTTP/REST)
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Database per service architecture

## Setup

```bash
# Start all services with Docker
docker-compose up --build

# Verify services
curl http://localhost:3000/health
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # User
curl http://localhost:3003/health  # Order
```

## API

All requests go through API Gateway (port 3000):

```bash
# Register
POST http://localhost:3000/api/auth/register
Body: { "email": "user@example.com", "password": "Pass123!", "firstName": "John", "lastName": "Doe" }

# Login
POST http://localhost:3000/api/auth/login
Body: { "email": "user@example.com", "password": "Pass123!" }

# Get user
GET http://localhost:3000/api/users/1
Headers: { "Authorization": "Bearer <token>" }

# Create order
POST http://localhost:3000/api/orders
Headers: { "Authorization": "Bearer <token>" }
Body: { "items": [...], "totalAmount": 100.00 }
```

## Architecture

```
Client → API Gateway (3000) → Services → PostgreSQL Databases
         ├─ Auth Service (3001) → auth_db
         ├─ User Service (3002) → user_db
         └─ Order Service (3003) → order_db
```

- Each service has independent PostgreSQL database
- Services communicate via HTTP/REST for token verification
- Docker containers for consistent environments
- API Gateway routes requests to appropriate services
