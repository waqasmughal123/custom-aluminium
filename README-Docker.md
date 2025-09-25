# Docker Setup Guide - Custom Aluminium Frontend

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Django backend running on host machine (port 8000)

### 1. Build and Start Services
```bash
# Start all services (Frontend + Nginx)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 2. Access the Application
- **Frontend**: http://localhost:3000 (Next.js direct)
- **Frontend (via Nginx)**: http://localhost:8080 (with proxy features)
- **Health Check**: http://localhost:8080/health

## 📁 Project Structure

```
custom-aluminium-frontend/
├── docker-compose.yml          # Multi-service configuration
├── Dockerfile                  # Next.js app container
├── nginx/
│   ├── nginx.conf             # Main Nginx configuration
│   └── conf.d/
│       └── default.conf       # Frontend proxy configuration
├── environment/
│   └── .env.dev              # Environment variables
└── ...
```

## 🚀 Access Methods

### 🎯 Direct Access (Recommended for Development)
- **URL**: http://localhost:3000
- **Features**: 
  - ✅ Direct Next.js server access
  - ✅ Faster response times
  - ✅ Real-time hot reload
  - ✅ Next.js development features
- **Use When**: Active development, debugging, testing

### 🌐 Nginx Proxy Access (Production-like)
- **URL**: http://localhost:8080
- **Features**:
  - ✅ Security headers
  - ✅ Static asset caching
  - ✅ Gzip compression
  - ✅ Load balancing ready
  - ✅ SSL termination ready
- **Use When**: Testing production setup, performance testing

## ⚙️ Configuration

### Environment Variables (`environment/.env.dev`)
```bash
# Next.js Environment
NODE_ENV=development

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Backend API Configuration
NEXT_PUBLIC_DJANGO_API_URL=http://host.docker.internal:8000
```

### Services Overview

#### 🎯 Frontend Service
- **Container**: Next.js development server
- **Ports**: 3000:3000 (direct access)
- **Features**: Hot reload, volume mounting, direct access
- **Network**: app-network

#### 🌐 Nginx Service
- **Container**: Nginx Alpine
- **External Ports**: 8080 (HTTP), 8443 (HTTPS ready)
- **Features**: Reverse proxy, static caching, security headers, load balancing
- **Use Case**: Production-like setup with advanced features
- **Network**: app-network

## 🔧 Development Features

### Hot Reload
- ✅ File changes auto-reload via Docker volumes
- ✅ WebSocket support for Next.js HMR
- ✅ Nginx proxy maintains connections

### Caching Strategy
- **Static Assets**: 1 year cache with immutable headers
- **API Routes**: No caching (real-time data)
- **Next.js Build**: Optimized asset delivery

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Referrer-Policy: strict-origin-when-cross-origin

## 🏗️ Docker Commands

### Basic Operations
```bash
# Start services
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f frontend
docker-compose logs -f nginx

# Shell access
docker-compose exec frontend sh
docker-compose exec nginx sh
```

### Development Workflow
```bash
# 1. Start development environment
docker-compose up --build

# 2. Make changes to code (auto-reloads)

# 3. View logs if needed
docker-compose logs -f

# 4. Stop when done
docker-compose down
```

## 🔍 Troubleshooting

### Common Issues

#### 🚨 Port Already in Use
```bash
# Check what's using port 3000 or 8080
lsof -i :3000
lsof -i :8080

# Stop services and restart
docker-compose down
docker-compose up
```

#### 🚨 Frontend Not Loading
```bash
# Check frontend container logs
docker-compose logs frontend

# Check Nginx logs
docker-compose logs nginx

# Verify containers are running
docker-compose ps
```

#### 🚨 Django API Connection Issues
1. **Verify Django is running on host**:
   ```bash
   curl http://localhost:8000/api/auth/login/
   ```

2. **Test from Docker container**:
   ```bash
   docker-compose exec frontend sh -c 'curl http://host.docker.internal:8000/api/auth/login/'
   ```

3. **Update Django CORS settings** (see DJANGO-CORS-FIX.md)

### Health Checks
```bash
# Application health (via Nginx)
curl http://localhost:8080/health

# Frontend direct access
curl http://localhost:3000

# Backend connectivity
curl http://localhost:8000/admin/
```

## 🌐 Network Architecture

```
Browser → Frontend Container (Port 3000) [Direct Access]
    ↓
Browser → Nginx (Port 8080) → Frontend Container (Port 3000) [Via Proxy]
    ↓
Frontend Container → host.docker.internal:8000 → Django Backend
```

## 📝 Next Steps

1. **SSL/HTTPS**: Configure SSL certificates for production
2. **Load Balancing**: Scale frontend containers if needed
3. **Monitoring**: Add health checks and monitoring
4. **Production**: Use multi-stage builds for optimization

## 🔗 Related Files

- `docker-compose.yml` - Service orchestration
- `Dockerfile` - Frontend container definition
- `nginx/` - Nginx configuration files
- `DJANGO-CORS-FIX.md` - Backend connectivity guide
- `test-django-api.sh` - API testing script 