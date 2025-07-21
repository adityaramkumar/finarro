# 🔐 Admin Dashboard Setup Guide

This guide will help you set up the admin dashboard for tracking user analytics, site visits, and business metrics.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Creating Your First Admin User](#creating-your-first-admin-user)
5. [Accessing the Dashboard](#accessing-the-dashboard)
6. [Features Overview](#features-overview)
7. [IP Geolocation Setup](#ip-geolocation-setup)
8. [Subdomain Configuration](#subdomain-configuration)

## 🚀 Quick Start

### 1. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 2. Create First Admin User

```bash
npm run create-admin
```

Follow the prompts to create your super admin account.

### 3. Start the Services

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

### 4. Access Admin Dashboard

Visit `http://localhost:3000/admin` and log in with your admin credentials.

## 🔧 Environment Variables

Add these environment variables to your backend `.env` file:

### Required Variables

```bash
# Admin Authentication
ADMIN_JWT_SECRET=your-super-secure-admin-secret-key-here
ADMIN_JWT_EXPIRES_IN=24h

# Session Secret for Analytics Tracking
SESSION_SECRET=your-session-secret-for-analytics-tracking
```

### Optional Variables

```bash
# IP Geolocation Service (Optional but Recommended)
IPAPI_KEY=your-ipapi-key-here

# Analytics Configuration
SKIP_ANALYTICS_TRACKING=false  # Set to true to disable analytics in development
```

## 🗄️ Database Setup

The admin dashboard uses several new database tables:

- **`site_visits`**: Tracks every page visit with IP, location, device info
- **`admin_users`**: Stores admin user accounts with roles and permissions
- **`business_metrics`**: Aggregated metrics for faster dashboard loading
- **`user_actions`**: Tracks specific user actions (login, signup, etc.)

All tables are created automatically when you run `npm run migrate`.

## 👤 Creating Your First Admin User

### Interactive Setup

```bash
cd backend
npm run create-admin
```

### Manual Setup (Advanced)

If you prefer to create admin users programmatically:

```javascript
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function createAdmin() {
  const passwordHash = await bcrypt.hash('your-secure-password', 14);
  
  await db('admin_users').insert({
    username: 'admin',
    email: 'admin@yourcompany.com',
    password_hash: passwordHash,
    first_name: 'Admin',
    last_name: 'User',
    role: 'super_admin'
  });
}
```

## 🌐 Accessing the Dashboard

### Local Development
- **URL**: `http://localhost:3000/admin`
- **Credentials**: Use the admin account you created

### Production
- **URL**: `https://yourdomain.com/admin` or `https://admin.yourdomain.com`
- **Security**: Always use HTTPS in production

## 📊 Features Overview

### Analytics Dashboard

- **Real-time Metrics**: User counts, visits, revenue
- **Geographic Analytics**: Visitor locations and countries
- **Device & Browser Breakdown**: Track user devices and browsers
- **Visit Trends**: Historical data with customizable timeframes
- **User Management**: View and manage user accounts
- **Revenue Tracking**: Subscription metrics and MRR

### Admin Roles & Permissions

- **Super Admin**: Full access to all features
- **Admin**: Read/write access to analytics and user management
- **Analyst**: Read-only access to analytics data

### Data Export

- Export user data, visits, and subscriptions
- CSV and JSON formats supported
- Date range filtering available

## 🌍 IP Geolocation Setup

To track visitor locations, sign up for an IP geolocation service:

### Recommended: IPApi.com

1. **Sign up**: Visit [ipapi.com](https://ipapi.com) and create a free account
2. **Get API Key**: Copy your API access key
3. **Add to Environment**: Set `IPAPI_KEY=your-key-here` in your `.env` file

### Free Tier Limits
- **1,000 requests/month** for free
- **$10/month** for 10,000 requests
- **$49/month** for 100,000 requests

### Alternative Services

You can also use these services by modifying the geolocation code in `backend/middleware/analytics.js`:

- **IPGeolocation.io**: Similar pricing and features
- **IPInfo.io**: Good free tier with 50k requests/month
- **MaxMind GeoLite2**: Free offline database (requires more setup)

## 🌐 Subdomain Configuration

### Option 1: Nginx Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/admin.finarro.com
server {
    listen 80;
    server_name admin.finarro.com;
    
    location / {
        proxy_pass http://localhost:3000/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: DNS Configuration

Add a CNAME record to your DNS:

```
Type: CNAME
Name: admin
Target: yourdomain.com
```

### Option 3: React Router (Current Setup)

The current setup uses React Router, so users can access the admin dashboard at:
- `yourdomain.com/admin`

## 🔒 Security Considerations

### Production Checklist

- [ ] Use HTTPS for all admin access
- [ ] Set strong `ADMIN_JWT_SECRET` (32+ characters)
- [ ] Use strong admin passwords (12+ characters)
- [ ] Regularly rotate admin passwords
- [ ] Monitor admin login attempts
- [ ] Limit admin access by IP if possible
- [ ] Enable rate limiting on admin routes

### Environment Security

```bash
# Use strong, unique secrets
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
```

## 📈 Analytics Data Flow

### 1. Data Collection
- **Frontend Visits**: Tracked automatically via middleware
- **User Actions**: Login, signup, subscription changes
- **API Calls**: All admin API calls are logged

### 2. Data Processing
- **Real-time**: Visit data stored immediately
- **Aggregation**: Business metrics calculated daily/weekly/monthly
- **Geolocation**: IP addresses resolved to locations asynchronously

### 3. Data Presentation
- **Dashboard**: Real-time charts and metrics
- **Export**: Raw data available for analysis
- **Alerts**: Optional email alerts for significant changes

## 🚨 Troubleshooting

### Common Issues

**"No admin token provided"**
- Make sure you're logged in to the admin dashboard
- Check that localStorage contains 'adminToken'

**"Migration failed: table.inet is not a function"**
- This was fixed in the migrations - run `npm run migrate` again

**"Cannot connect to database"**
- Ensure PostgreSQL is running
- Check database credentials in `.env`

**Analytics not tracking visits**
- Verify `trackVisit` middleware is active
- Check for JavaScript errors in browser console
- Ensure session middleware is configured

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
DEBUG=analytics:*
```

## 📞 Support

If you need help setting up the admin dashboard:

1. **Check the logs**: Backend logs show detailed error messages
2. **Verify environment**: Ensure all required env vars are set
3. **Test database**: Run migrations and check table creation
4. **Network issues**: Verify ports 3000 (frontend) and 3001 (backend) are open

## 🎯 Next Steps

After setup:

1. **Monitor Usage**: Check daily active users and top pages
2. **Set Goals**: Track KPIs like user growth and revenue
3. **Export Data**: Regular backups of analytics data
4. **Optimize**: Use insights to improve user experience
5. **Scale**: Consider upgrading IP geolocation plan as traffic grows

---

**🎉 Congratulations!** Your admin dashboard is now ready to provide insights into your application's performance and user behavior. 