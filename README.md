# finarro 

[![Deploy Status](https://github.com/adityaramkumar/finarro/actions/workflows/deploy.yml/badge.svg)](https://github.com/adityaramkumar/finarro/actions/workflows/deploy.yml)
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

# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Install all dependencies (frontend & backend)
- Create required .env files from templates
- Set up the PostgreSQL database
- Run database migrations
- Start both frontend and backend in development mode

### Manual Setup

If you prefer manual setup:

#### 1. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Database setup
npm run migrate
npm run seed

# Start development server
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.development
# Edit .env.development with your configuration

# Start development server
npm start
```

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

### Automated Deployment

The application uses GitHub Actions for automated deployment:

- **Trigger**: Push to `main` branch
- **Backend**: Deploys to AWS EC2 via SSH
- **Frontend**: Builds and deploys to AWS S3 + CloudFront
- **Database**: Runs migrations automatically

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
