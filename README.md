# finarro 

[![CI/CD Pipeline](https://github.com/adityaramkumar/finarro/actions/workflows/deploy.yml/badge.svg)](https://github.com/adityaramkumar/finarro/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live%20Site-finarro.com-blue)](https://finarro.com)
[![API Status](https://img.shields.io/badge/API-api.finarro.com-green)](https://api.finarro.com/health)

**AI-powered financial assistant with real bank integration, chat capabilities, and comprehensive portfolio management.**

🔗 **Live Application**: [finarro.com](https://finarro.com)  
🔗 **API Endpoint**: [api.finarro.com](https://api.finarro.com)

## ✨ Features

- 🤖 **AI Financial Assistant** - Chat with your finances using Google Gemini
- 🏦 **Bank Integration** - Connect real accounts via Plaid API
- 📊 **Portfolio Management** - Track investments, transactions, and analytics
- 📄 **Document Analysis** - Upload and analyze financial documents
- 💳 **Subscription Management** - Stripe-powered Pro subscriptions
- 🔐 **Secure Authentication** - JWT-based auth with email verification
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🚀 **Auto-Deploy** - CI/CD pipeline with GitHub Actions

## 🏗️ Architecture

```
Frontend (React)     Backend (Node.js)      Database (PostgreSQL)
     ↓                      ↓                       ↓
    S3 + CloudFront    EC2 + nginx + SSL       AWS RDS
    finarro.com        api.finarro.com         Managed DB
```

## 🚀 Production Deployment

The application is fully deployed and running in production:

- **Frontend**: React app hosted on AWS S3 + CloudFront at [finarro.com](https://finarro.com)
- **Backend**: Node.js API on AWS EC2 with SSL at [api.finarro.com](https://api.finarro.com)
- **Database**: PostgreSQL on AWS RDS with automated backups
- **CI/CD**: GitHub Actions pipeline for automated deployments
- **SSL**: Let's Encrypt certificates with auto-renewal
- **Domain**: Custom domain managed via Squarespace DNS

### Monitoring & Health

- **API Health**: [api.finarro.com/health](https://api.finarro.com/health)
- **Build Status**: Automated via GitHub Actions
- **Uptime**: Monitored via PM2 process manager
- **SSL**: Auto-renewing Let's Encrypt certificates

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ 
- PostgreSQL
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/adityaramkumar/finarro.git
cd finarro

# Check environment and auto-fix issues
./dev check
./dev env fix

# Start development environment
./dev start
```

The development tools will:
- Validate your environment setup
- Install all dependencies (frontend & backend)
- Create required .env files from templates
- Set up the PostgreSQL database
- Run database migrations
- Start both frontend and backend with hot reload

### Development Tools

All development scripts are organized in the `scripts/` directory with a simple launcher:

```bash
# Master development tool (via launcher)
./dev help           # Show all available commands
./dev check          # Validate environment
./dev start          # Start development environment
./dev test           # Run comprehensive tests
./dev docker         # Use Docker environment

# Direct script access
scripts/env-check.sh     # Environment validation
scripts/local-dev.sh     # Native development
scripts/test-local.sh    # Testing suite
```

### Development Options

**Native Development**
```bash
./dev start  # Uses your local PostgreSQL
```

**Option 2: Testing**
```bash
./dev test quick  # Quick validation
./dev test api    # API testing
./dev test perf   # Performance testing
```

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5432

### Troubleshooting

**Common Issues:**

1. **Port already in use**
   ```bash
   scripts/local-dev.sh clean
   ```

2. **Database connection failed**
   ```bash
   # Check PostgreSQL is running
   brew services start postgresql
   # or
   sudo systemctl start postgresql
   
   # Create database
   createdb finarro_dev
   ```

3. **Dependencies not installed**
   ```bash
   scripts/env-check.sh fix
   ```

4. **Environment files missing**
   ```bash
   scripts/local-dev.sh setup
   ```

**Health Checks:**
```bash
# Check environment
./dev check

# Check running services
./dev local health

# Test functionality
./dev test quick
```

**Logs and Debugging:**
```bash
# Development logs
scripts/local-dev.sh logs
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Manual Setup (Alternative)

If you prefer manual setup:

#### 1. Backend Setup

```bash
cd backend
npm install

# Create environment file
scripts/local-dev.sh setup

# Start development server
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
scripts/local-dev.sh setup

# Start development server
npm start
# Edit .env.development with your configuration

# Start development server
npm start
```

### Environment Configuration

**Backend Environment (`.env`):**
```bash
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/finarro_dev

# Server
NODE_ENV=development
PORT=3001

# Security
JWT_SECRET=your_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here

# Optional: AI Features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Financial Data
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox

# Optional: Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Frontend Environment (`.env.development`):**
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Optional: Payments
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Development
NODE_ENV=development
GENERATE_SOURCEMAP=true
```

## Testing

Comprehensive testing suite for validation:

```bash
# Run all tests
./dev test

# Quick essential tests
./dev test quick

# API-only tests
./dev test api

# Environment tests
./dev test env

# Performance tests
./dev test perf
```

**Test categories:**
- Service availability
- API endpoints  
- Database connectivity
- Authentication flow
- CORS configuration
- Static file serving
- Performance metrics

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/finarro
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finarro
DB_USER=username
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# External APIs
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENVIRONMENT=sandbox

STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Email (using Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Server
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.development)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

## 📁 Project Structure

```
finarro/
├── backend/                 # Node.js API server
│   ├── config/             # Database and logging configuration
│   ├── database/           # Knex migrations and schema
│   ├── middleware/         # Authentication and error handling
│   ├── routes/             # API route handlers
│   ├── services/           # External service integrations
│   └── server.js           # Express server entry point
│
├── frontend/               # React client application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── layouts/        # Page layout components
│   │   ├── pages/          # Route-based page components
│   │   └── services/       # API client and utilities
│   └── package.json
│
├── .github/workflows/      # CI/CD pipeline configuration
├── branding/               # Logo and brand assets
└── README.md
```

## 🔐 API Keys Setup

### Required API Keys

1. **Plaid** (Bank Integration)
   - Sign up at [plaid.com](https://plaid.com)
   - Get `CLIENT_ID` and `SECRET` for sandbox/development

2. **Stripe** (Payments)
   - Sign up at [stripe.com](https://stripe.com)
   - Get `PUBLISHABLE_KEY` and `SECRET_KEY` for test mode

3. **Google Gemini** (AI Chat)
   - Get API key from [Google AI Studio](https://aistudio.google.com/)

4. **Gmail SMTP** (Email Notifications)
   - Enable 2-factor authentication on Gmail
   - Generate app-specific password
   - Use your Gmail address and app password

### Environment Setup

1. Copy `.env.example` files to `.env`
2. Fill in your API keys and database credentials
3. Never commit `.env` files to version control

## 🚀 Deployment

### Automated CI/CD Pipeline

The application uses GitHub Actions for automated CI/CD:

- **Trigger**: Push to `main` branch
- **Code Quality**: ESLint checks run in parallel across frontend & backend
- **Backend Deployment**: Deploys to AWS EC2 via SSH with zero-downtime
- **Frontend Deployment**: Builds and deploys to AWS S3 + CloudFront
- **Database Migrations**: Runs automatically during backend deployment
- **Health Checks**: Verifies deployment success before completion

The pipeline runs **linting in parallel** with deployment for faster feedback.

### Manual Deployment

#### Backend (AWS EC2)

```bash
# SSH into EC2 instance
ssh -i finarro-key.pem ec2-user@api.finarro.com

# Update application
cd /var/www/finarro/backend
git pull origin main
npm install
npm run migrate

# Restart with PM2
pm2 restart finarro-backend
pm2 save
```

#### Frontend (AWS S3)

```bash
# Build production bundle
cd frontend
npm run build

# Deploy to S3
aws s3 sync build/ s3://finarro-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Production Infrastructure

- **EC2 Instance**: t3.medium (AWS us-east-2)
- **RDS Database**: PostgreSQL 15.x (Multi-AZ for high availability)
- **S3 Bucket**: Static website hosting with CloudFront CDN
- **SSL Certificates**: Let's Encrypt with automatic renewal
- **Process Management**: PM2 for Node.js process management
- **Reverse Proxy**: nginx for SSL termination and routing

## 📊 Monitoring & Maintenance

### Health Checks

- **API Health**: `GET /health` endpoint
- **Database**: Connection pooling with retry logic
- **Process Monitoring**: PM2 automatic restarts

### Logs

```bash
# Application logs
pm2 logs finarro-backend

# nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Backups

- **Database**: Automated daily backups via AWS RDS
- **Application**: Code stored in GitHub
- **Environment**: Secrets managed via GitHub Secrets

## 🔧 Development

### Code Quality

The project uses comprehensive linting and code quality tools:

```bash
# Run linters
npm run lint              # Check both frontend and backend
npm run lint:fix         # Auto-fix linting issues

# Frontend specific
cd frontend
npm run lint
npm run lint:fix

# Backend specific  
cd backend
npm run lint
npm run lint:fix
```

### Pre-commit Hooks

- **Husky**: Runs linting before commits
- **lint-staged**: Auto-fixes staged files
- **ESLint**: Enforces code quality standards

### Testing

```bash
# Run tests
npm test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure linting passes
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow ESLint rules for code consistency
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/adityaramkumar/finarro/issues)
- **Email**: support@finarro.com
- **Status**: [api.finarro.com/health](https://api.finarro.com/health)

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ by the finarro team**
