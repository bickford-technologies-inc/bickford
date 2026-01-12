#!/bin/bash

set -e

echo "🚂 Bickford Railway Setup Automation"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get project name from package.json or use default
PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null | sed 's/.*\///' || echo "bickford")

# Get GitHub repository from git remote or use default
GIT_REMOTE=$(git config --get remote.origin.url 2>/dev/null || echo "")
if [[ -n "$GIT_REMOTE" ]]; then
    # Extract owner/repo from various git URL formats
    GITHUB_REPO=$(echo "$GIT_REMOTE" | sed -E 's/.*[:/]([^/]+\/[^/]+?)(\.git)?$/\1/')
else
    GITHUB_REPO="bickfordd-bit/bickford"
fi

echo "Project: ${PROJECT_NAME}"
echo "GitHub: ${GITHUB_REPO}"
echo ""

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

echo -e "${BLUE}Step 1: Authenticating with Railway...${NC}"
echo "This will open your browser for authentication."
echo ""

# Try standard login first
if railway login; then
    echo -e "${GREEN}✓ Authentication successful${NC}"
else
    echo -e "${YELLOW}Standard login failed. Trying browserless...${NC}"
    if railway login --browserless; then
        echo -e "${GREEN}✓ Authentication successful (browserless)${NC}"
    else
        echo -e "${RED}✗ Authentication failed${NC}"
        echo "Please authenticate manually with: railway login"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Step 2: Creating Railway project...${NC}"

# Create project
railway init <<EOF
${PROJECT_NAME}
EOF

echo -e "${GREEN}✓ Project '${PROJECT_NAME}' created${NC}"
echo ""

echo -e "${BLUE}Step 3: Linking GitHub repository...${NC}"
railway link ${GITHUB_REPO}
echo -e "${GREEN}✓ Repository linked${NC}"
echo ""

echo -e "${BLUE}Step 4: Adding PostgreSQL database...${NC}"
railway add --database postgres
echo -e "${GREEN}✓ PostgreSQL database added${NC}"
echo ""

echo -e "${BLUE}Step 5: Deploying to Railway...${NC}"
railway up
echo -e "${GREEN}✓ Deployment initiated${NC}"
echo ""

echo -e "${BLUE}Step 6: Generating public domain...${NC}"
if DOMAIN=$(railway domain 2>&1); then
    echo -e "${GREEN}✓ Domain generated: ${DOMAIN}${NC}"
    echo ""
    
    echo "===================================="
    echo -e "${GREEN}✓ Setup Complete!${NC}"
    echo ""
    echo "Your Bickford deployment:"
    echo -e "  URL: ${BLUE}${DOMAIN}${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Wait for deployment to complete (check Railway dashboard)"
    echo "  2. Test health endpoint: curl ${DOMAIN}/api/health"
    echo "  3. Add GitHub secrets for CI/CD:"
    echo "     - RAILWAY_TOKEN (get from Railway dashboard)"
    echo "     - RAILWAY_URL=${DOMAIN}"
    echo ""
    echo "View deployment: railway open"
else
    echo -e "${YELLOW}⚠ Domain generation failed or not ready yet${NC}"
    echo ""
    
    echo "===================================="
    echo -e "${GREEN}✓ Setup Complete!${NC}"
    echo ""
    echo "Railway project created and deployment initiated."
    echo ""
    echo "Next steps:"
    echo "  1. Wait for deployment to complete (check Railway dashboard)"
    echo "  2. Generate domain: railway domain"
    echo "  3. View deployment: railway open"
    echo "  4. Add GitHub secrets for CI/CD:"
    echo "     - RAILWAY_TOKEN (get from Railway dashboard)"
    echo "     - RAILWAY_URL=<your generated domain>"
fi

exit 0
