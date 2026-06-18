#!/bin/bash
# RestPoint Production Deployment

set -e
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}RestPoint Deployment${NC}"
echo ""

echo -e "${BLUE}[1/5] Pre-flight checks...${NC}"
command -v docker >/dev/null || { echo -e "${RED}✗ Docker not found${NC}"; exit 1; }
echo -e "${GREEN}✓ Docker found${NC}"
echo ""

echo -e "${BLUE}[2/5] Generate service .env files...${NC}"
bash scripts/generate-env-files.sh > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Done${NC}"
echo ""

echo -e "${BLUE}[3/5] Validate configurations...${NC}"
docker-compose config > /dev/null || { echo -e "${RED}✗ Invalid${NC}"; exit 1; }
echo -e "${GREEN}✓ Valid${NC}"
echo ""

echo -e "${BLUE}[4/5] Build services...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Built${NC}"
echo ""

echo -e "${BLUE}[5/5] Start services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Started${NC}"
echo ""

sleep 30
echo -e "${GREEN}Deployment complete!${NC}"
docker-compose ps
