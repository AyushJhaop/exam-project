# Deployment Guide - Sehat Mitra

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Domain name (optional)
- SSL certificate (for HTTPS)

### Environment Setup

#### Backend Environment Variables
Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sehat-mitra
JWT_SECRET=your-super-secure-jwt-secret-key
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend Environment Variables
Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

### Build Process

#### 1. Frontend Build
```bash
cd sehat-mitra
npm run build
```

#### 2. Backend Preparation
```bash
cd backend
npm install --production
```

### Deployment Options

## Option 1: Heroku Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create sehat-mitra-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Netlify)
```bash
# Build the project
npm run build

# Deploy to Netlify (using Netlify CLI)
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Option 2: VPS Deployment (Ubuntu)

### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Application Deployment
```bash
# Clone repository
git clone <your-repo-url>
cd sehat-mitra

# Install dependencies
npm run install:all

# Build frontend
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'sehat-mitra-api',
    cwd: './backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: 'your-mongodb-uri',
      JWT_SECRET: 'your-jwt-secret'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/sehat-mitra

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /path/to/sehat-mitra/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/sehat-mitra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Option 3: Docker Deployment

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: sehat-mitra-db
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: sehat-mitra-api
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/sehat-mitra?authSource=admin
      JWT_SECRET: your-jwt-secret
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: .
    container_name: sehat-mitra-web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Update deployment
docker-compose pull
docker-compose up -d --force-recreate
```

## Monitoring & Maintenance

### Performance Monitoring
```bash
# Install monitoring tools
npm install -g clinic

# Performance profiling
clinic doctor -- node server.js
clinic flame -- node server.js
```

### Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/sehat-mitra

# Add configuration:
/var/log/sehat-mitra/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
}
```

### Database Backup
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/sehat-mitra" --out="/backup/mongodb_$DATE"
tar -czf "/backup/mongodb_$DATE.tar.gz" "/backup/mongodb_$DATE"
rm -rf "/backup/mongodb_$DATE"

# Schedule with cron
0 2 * * * /path/to/backup-script.sh
```

### Security Checklist
- [ ] Environment variables properly set
- [ ] MongoDB authentication enabled
- [ ] JWT secret is strong and unique
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] CORS properly configured

### Health Checks
```bash
# API health check endpoint
curl https://api.yourdomain.com/health

# Database connection check
curl https://api.yourdomain.com/api/health/db

# System status
pm2 status
systemctl status nginx
systemctl status mongodb
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

2. **Node.js Application Errors**
   ```bash
   # Check PM2 logs
   pm2 logs sehat-mitra-api
   
   # Restart application
   pm2 restart sehat-mitra-api
   ```

3. **Nginx Configuration Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

### Performance Optimization

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

2. **Database Indexing**
   ```javascript
   // Add in MongoDB
   db.appointments.createIndex({ "patientId": 1, "date": 1 })
   db.users.createIndex({ "email": 1 }, { unique: true })
   ```

3. **Caching Headers**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

---

This deployment guide provides comprehensive instructions for deploying Sehat Mitra in various environments. Choose the option that best fits your infrastructure requirements and technical expertise.
