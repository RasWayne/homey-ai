#!/bin/bash

echo "-------------------------------------"
echo "Homey AI Local Development Setup"
echo "-------------------------------------"

echo ""
echo "Checking Docker installation..."

if ! command -v docker &> /dev/null
then
  echo "Docker not installed."
  echo "Install Docker Desktop:"
  echo "https://www.docker.com/products/docker-desktop/"
  exit 1
fi

echo "Docker OK."

echo ""
echo "Checking Docker Compose..."

if ! docker compose version &> /dev/null
then
  echo "Docker Compose not available."
  exit 1
fi

echo "Docker Compose OK."

echo ""
echo "Configuring OpenAI API Key..."

if [ -z "$OPENAI_API_KEY" ]; then
  echo "Enter OpenAI API key:"
  read -r OPENAI_API_KEY
  export OPENAI_API_KEY=$OPENAI_API_KEY
fi

echo "OPENAI_API_KEY configured."

echo ""
echo "Installing dependencies..."

cd backend
npm install
cd ../frontend
npm install
cd ..

echo ""
echo "Starting Docker containers..."

docker compose up -d --build

echo ""
echo "Waiting for database..."
sleep 5

echo ""
echo "Running Prisma migrations..."

docker compose exec backend npx prisma migrate deploy

echo ""
echo "Seeding database..."

docker compose exec backend npm run prisma:seed

echo ""
echo "Creating demo data..."

export DATABASE_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/homeyai}
export PATH="$(pwd)/backend/node_modules/.bin:$PATH"
npx tsx backend/scripts/seed-demo.ts

echo ""
echo "-------------------------------------"
echo "Homey AI running locally"
echo ""
echo "Frontend:"
echo "http://localhost:3000"
echo ""
echo "Backend:"
echo "http://localhost:4000/api/v1"
echo "-------------------------------------"
