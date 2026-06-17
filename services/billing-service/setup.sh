#!/bin/bash
# Billing Service Setup Script
# This script sets up the billing service with database and dependencies

echo "=========================================="
echo "Billing Service Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if Python is installed (optional)
if command -v python3 &> /dev/null; then
    echo "✓ Python version: $(python3 --version)"
else
    echo "⚠️  Python not found. Python fallback service will not be available."
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL client not found. Please install MySQL client."
    exit 1
fi

echo "✓ MySQL client found"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo "✓ Node.js dependencies installed"
echo ""

# Install Python dependencies (optional)
if command -v python3 &> /dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Failed to install Python dependencies. Fallback service will not be available."
    else
        echo "✓ Python dependencies installed"
    fi
    echo ""
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
echo "✓ Logs directory created"
echo ""

# Database setup
echo "=========================================="
echo "Database Setup"
echo "=========================================="
echo ""

# Get database credentials
read -p "Database Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Database User (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Database Password: " DB_PASSWORD
echo ""

read -p "Database Name (default: tenant_tracking): " DB_NAME
DB_NAME=${DB_NAME:-tenant_tracking}

echo ""
echo "Running database migrations..."
echo ""

# Run migrations
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < migrations/001_create_billing_tables.sql

if [ $? -ne 0 ]; then
    echo "❌ Failed to run database migrations"
    echo "Please check your database credentials and try again."
    exit 1
fi

echo "✓ Database migrations completed"
echo ""

# Update .env file
echo "=========================================="
echo "Configuration"
echo "=========================================="
echo ""

read -p "Do you want to update .env file with database credentials? (y/n): " UPDATE_ENV

if [ "$UPDATE_ENV" = "y" ] || [ "$UPDATE_ENV" = "Y" ]; then
    sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
    sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env
    sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    
    echo "✓ .env file updated"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the billing service:"
echo "  npm start          # Start Node.js service"
echo ""
echo "To start Python fallback (optional):"
echo "  python3 fallback_billing.py"
echo ""
echo "To test the service:"
echo "  curl http://localhost:5020/health"
echo ""
echo "To run manual billing:"
echo "  curl -X POST http://localhost:5020/api/billing/run"
echo ""
echo "For more information, see README.md"
echo ""