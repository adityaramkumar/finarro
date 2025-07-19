#!/bin/bash

# finarro Setup Script
# This script helps you quickly set up the development environment

echo "🚀 Welcome to finarro setup!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    echo "   Visit: https://postgresql.org/download/"
    exit 1
fi

echo "✅ Node.js and PostgreSQL are installed"
echo ""

# Create backend environment file
echo "📝 Creating backend environment file..."
cat > backend/.env << EOF
# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/finarro_dev
NODE_ENV=development
PORT=3001

# JWT Secrets (generate with crypto.randomBytes(64).toString('hex'))
JWT_SECRET=your_jwt_secret_here_64_character_string
JWT_REFRESH_SECRET=your_refresh_secret_here_64_character_string

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Plaid Configuration (Financial Data)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox

# Stripe Configuration (Payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_monthly_subscription_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (for user verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EOF

# Create frontend environment file
echo "📝 Creating frontend environment file..."
cat > frontend/.env.development << EOF
# Frontend Environment Configuration

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Stripe Configuration (Payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Environment
NODE_ENV=development
GENERATE_SOURCEMAP=true
EOF

echo ""
echo "📁 Environment files created:"
echo "   backend/.env"
echo "   frontend/.env.development"
echo ""
echo "⚠️  IMPORTANT: Edit these files with your actual API keys before running the app"
echo ""
echo "📚 Next steps:"
echo "   1. Edit backend/.env with your database credentials and API keys"
echo "   2. Edit frontend/.env.development with your API keys"
echo "   3. Create database: createdb finarro_dev"
echo "   4. Install dependencies:"
echo "      cd backend && npm install"
echo "      cd ../frontend && npm install"
echo "   5. Run migrations: cd backend && npm run migrate"
echo "   6. Start development servers:"
echo "      Backend: cd backend && npm run dev"
echo "      Frontend: cd frontend && npm start"
echo ""
echo "🔗 See README.md for detailed setup instructions including API key setup"
echo ""
echo "🎉 Setup complete! Happy coding!" 