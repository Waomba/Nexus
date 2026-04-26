#!/bin/bash
# NEXUS Quick Setup Script

echo "======================================"
echo "  NEXUS Platform Setup"
echo "======================================"
echo ""

# Check PHP
if ! command -v php &>/dev/null; then
  echo "❌ PHP not found. Please install PHP 8.2+"
  exit 1
fi
PHP_VER=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "✅ PHP $PHP_VER found"

# Check Node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+"
  exit 1
fi
NODE_VER=$(node -v)
echo "✅ Node.js $NODE_VER found"

# Check MySQL
if ! command -v mysql &>/dev/null; then
  echo "⚠️  mysql CLI not found. Please create the database manually."
else
  echo "✅ MySQL found"
  echo ""
  echo "Creating database nexus_db..."
  read -p "MySQL root password (leave blank if none): " -s MYSQL_PASS
  echo ""
  if [ -z "$MYSQL_PASS" ]; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS nexus_db CHARACTER SET utf8mb4;" 2>/dev/null && echo "✅ Database created"
    mysql -u root nexus_db < backend/database/schema.sql 2>/dev/null && echo "✅ Schema imported"
  else
    mysql -u root -p"$MYSQL_PASS" -e "CREATE DATABASE IF NOT EXISTS nexus_db CHARACTER SET utf8mb4;" 2>/dev/null && echo "✅ Database created"
    mysql -u root -p"$MYSQL_PASS" nexus_db < backend/database/schema.sql 2>/dev/null && echo "✅ Schema imported"
  fi
fi

echo ""
echo "Installing frontend dependencies..."
cd frontend && npm install --silent && echo "✅ Frontend dependencies installed" && cd ..

echo ""
echo "======================================"
echo "  Setup complete!"
echo ""
echo "  To start the backend:"
echo "  cd backend && php -S localhost:8000 -t public"
echo ""
echo "  To start the frontend (new terminal):"
echo "  cd frontend && npm run dev"
echo ""
echo "  Admin login:"
echo "  URL:      http://localhost:5173/admin/login"
echo "======================================"
