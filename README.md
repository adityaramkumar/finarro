# finarro 

[![CI/CD Pipeline](https://github.com/adityaramkumar/finarro/actions/workflows/deploy.yml/badge.svg)](https://github.com/adityaramkumar/finarro/actions/workflows/deploy.yml)
[![Code Quality](https://github.com/adityaramkumar/finarro/actions/workflows/code-quality.yml/badge.svg)](https://github.com/adityaramkumar/finarro/actions/workflows/code-quality.yml)
[![Live Site](https://img.shields.io/badge/Live%20Site-finarro.com-blue)](https://finarro.com)
[![API Status](https://img.shields.io/badge/API-api.finarro.com-green)](https://api.finarro.com/health)

**AI-powered financial assistant with real bank integration, chat capabilities, and comprehensive portfolio management.**

🔗 **Live Application**: [finarro.com](https://finarro.com)  
🔗 **API Endpoint**: [api.finarro.com](https://api.finarro.com)

## ✨ Features

- **AI Financial Assistant** - Chat with your finances using Google Gemini
- **Bank Integration** - Connect real accounts via Plaid API  
- **Portfolio Management** - Track investments, transactions, and analytics
- **Document Analysis** - Upload and analyze financial documents
- **Subscription Management** - Stripe-powered Pro subscriptions
- **Secure Authentication** - JWT-based auth with email verification
- **Responsive Design** - Works seamlessly on all devices
- **Auto-Deploy** - CI/CD pipeline with GitHub Actions

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
- PostgreSQL 12+
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/adityaramkumar/finarro.git
cd finarro

# Check environment and auto-fix issues
./dev check

# Start development environment
./dev start

# Format code
./dev format
```

### Development Commands

```bash
./dev help           # Show all available commands
./dev check          # Validate environment setup
./dev start          # Start both frontend and backend
./dev test           # Run comprehensive test suite
./dev format         # Format code with Prettier + ESLint
./dev env            # Environment management tools
```

### Manual Setup (Alternative)

If you prefer manual setup:

#### Backend Setup
```bash
cd backend
npm install

# Create environment file (see .env.example)
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run migrate

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install

# Create environment file (see .env.development.example)
cp .env.development.example .env.development
# Edit .env.development with your configuration

# Start development server
npm start
```

## 📁 Project Structure

```
finarro/
├── backend/                 # Node.js API server
│   ├── config/             # Database and logging configuration
│   ├── database/           # Knex migrations and schema
│   │   └── migrations/     # Database migration files
│   ├── middleware/         # Authentication and error handling
│   ├── routes/             # API route handlers
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── plaid.js        # Plaid integration
│   │   ├── dashboard.js    # Dashboard data
│   │   └── ...             # Other API routes
│   ├── services/           # External service integrations
│   ├── .env.example        # Environment template
│   └── server.js           # Express server entry point
│
├── frontend/               # React client application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── PlaidLink.js  # Plaid bank connection
│   │   │   └── ...         # Other components
│   │   ├── contexts/       # React context providers
│   │   ├── layouts/        # Page layout components
│   │   ├── pages/          # Route-based page components
│   │   │   ├── DashboardPage.js
│   │   │   ├── SettingsPage.js
│   │   │   └── ...         # Other pages
│   │   └── services/       # API client and utilities
│   ├── .env.development.example  # Frontend environment template
│   └── package.json
│
├── scripts/                # Development and deployment scripts
│   ├── dev.sh              # Master development script
│   ├── env-check.sh        # Environment validation
│   ├── local-dev.sh        # Local development setup
│   └── test-local.sh       # Testing utilities
│
├── .github/workflows/      # CI/CD pipeline configuration
├── branding/               # Logo and brand assets
└── README.md
```

## ⚙️ Configuration

### Backend Environment (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```bash
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/finarro_dev
NODE_ENV=development
PORT=3001

# Authentication
JWT_SECRET=your_secure_64_character_jwt_secret_here
JWT_REFRESH_SECRET=your_secure_64_character_refresh_secret_here

# Plaid (Bank Integration)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Frontend Environment (.env.development)

Copy `frontend/.env.development.example` to `frontend/.env.development`:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Stripe (Payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Development
NODE_ENV=development
GENERATE_SOURCEMAP=true
```

## 🔐 API Keys Setup

### Required Services

1. **Plaid** (Bank Integration)
   - Sign up at [plaid.com](https://plaid.com)
   - Get `CLIENT_ID` and `SECRET` for sandbox/development
   - For production: upgrade to live keys

2. **Stripe** (Payments)
   - Sign up at [stripe.com](https://stripe.com)
   - Get `PUBLISHABLE_KEY` and `SECRET_KEY` for test mode
   - Create a subscription price and get `PRICE_ID`

3. **Google Gemini** (AI Chat)
   - Get API key from [Google AI Studio](https://aistudio.google.com/)
   - Free tier available for development

4. **Gmail SMTP** (Email Notifications, Optional)
   - Enable 2-factor authentication on Gmail
   - Generate app-specific password
   - Use your Gmail address and app password

## 🧪 Testing

```bash
# Run all tests
./dev test

# Test specific areas
./dev test api          # API endpoints only
./dev test env          # Environment validation
./dev test performance  # Performance benchmarks

# Format code
./dev format            # Prettier + ESLint for both frontend & backend
```

## 📝 Code Formatting

The project uses Prettier and ESLint for consistent code formatting:

```bash
# Format all code (recommended before commits)
./dev format

# Manual formatting
cd frontend && npm run format:lint
cd backend && npm run format:lint
```

## 🚀 Deployment

The application uses GitHub Actions for automated CI/CD:

- **Trigger**: Push to `main` branch
- **Code Quality**: ESLint and Prettier checks
- **Backend**: Deploys to AWS EC2 with zero-downtime
- **Frontend**: Builds and deploys to AWS S3 + CloudFront

### Production Environment

- **Frontend**: AWS S3 + CloudFront CDN
- **Backend**: AWS EC2 with PM2 process manager
- **Database**: AWS RDS PostgreSQL with automated backups
- **SSL**: Let's Encrypt with auto-renewal
- **Monitoring**: PM2 monitoring and health checks

## 📊 Monitoring

- **Application Health**: `api.finarro.com/health`
- **Build Status**: GitHub Actions
- **Performance**: PM2 monitoring
- **SSL Certificate**: Auto-renewal monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and run: `./dev format`
4. Test your changes: `./dev test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For support and questions:
- **Email**: hello@finarro.com
- **Documentation**: See inline code comments and this README
- **Issues**: Create a GitHub issue for bugs or feature requests
