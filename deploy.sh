#!/bin/bash

# ============================================
# AI Analyst (Next.js + Convex) to GCP Cloud Run Deployment Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-analyst"
REGION="us-central1"  # Change this to your preferred region
SERVICE_NAME="ai-analyst"

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

print_message "🚀 AI Analyst (Next.js + Convex) Cloud Run Deployment" "$BLUE"
echo ""

# ============================================
# Step 0: Important Prerequisites
# ============================================
print_message "⚠️  IMPORTANT: Before deploying the frontend..." "$YELLOW"
echo ""
echo "1. Make sure your Convex backend is deployed:"
echo "   npx convex deploy --prod"
echo ""
echo "2. Have your environment variables ready:"
echo "   - NEXT_PUBLIC_CONVEX_URL (from Convex dashboard)"
echo "   - CONVEX_DEPLOY_KEY (from Convex dashboard)"
echo "   - OPENAI_API_KEY"
echo "   - GOOGLE_GENERATIVE_AI_API_KEY"
echo "   - GROQ_API_KEY (if using Groq)"
echo ""
read -p "Have you deployed Convex and have all environment variables? (y/n): " ready
if [[ "$ready" != "y" && "$ready" != "Y" ]]; then
    print_message "Please deploy Convex first: npx convex deploy --prod" "$RED"
    exit 1
fi

echo ""

# ============================================
# Step 1: Check Prerequisites
# ============================================
print_message "📋 Checking prerequisites..." "$YELLOW"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_message "❌ Docker is not installed. Please install Docker first." "$RED"
    exit 1
fi
print_message "✅ Docker is installed" "$GREEN"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_message "❌ gcloud CLI is not installed. Please install it first:" "$RED"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi
print_message "✅ gcloud CLI is installed" "$GREEN"

echo ""

# ============================================
# Step 2: Get GCP Project ID
# ============================================
print_message "🔧 GCP Project Configuration" "$YELLOW"

# Try to get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$CURRENT_PROJECT" ]; then
    echo "No GCP project is currently set."
    read -p "Enter your GCP Project ID: " GCP_PROJECT
else
    echo "Current GCP project: $CURRENT_PROJECT"
    read -p "Use this project? (y/n) [y]: " use_current
    use_current=${use_current:-y}

    if [[ "$use_current" == "y" || "$use_current" == "Y" ]]; then
        GCP_PROJECT=$CURRENT_PROJECT
    else
        read -p "Enter your GCP Project ID: " GCP_PROJECT
    fi
fi

# Set the project
gcloud config set project $GCP_PROJECT
print_message "✅ Using GCP project: $GCP_PROJECT" "$GREEN"

echo ""

# ============================================
# Step 3: Get Environment Variables
# ============================================
print_message "🔐 Environment Configuration" "$YELLOW"

echo "Enter your environment variables (these will be securely passed to Cloud Run):"
echo ""

read -p "NEXT_PUBLIC_CONVEX_URL: " CONVEX_URL
if [ -z "$CONVEX_URL" ]; then
    print_message "❌ NEXT_PUBLIC_CONVEX_URL is required" "$RED"
    exit 1
fi

read -p "CONVEX_DEPLOY_KEY: " CONVEX_DEPLOY_KEY
if [ -z "$CONVEX_DEPLOY_KEY" ]; then
    print_message "⚠️  Warning: CONVEX_DEPLOY_KEY not provided. This may be needed for some operations." "$YELLOW"
fi

read -p "OPENAI_API_KEY: " OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    print_message "⚠️  Warning: OPENAI_API_KEY not provided" "$YELLOW"
fi

read -p "GOOGLE_GENERATIVE_AI_API_KEY: " GOOGLE_API_KEY
if [ -z "$GOOGLE_API_KEY" ]; then
    print_message "⚠️  Warning: GOOGLE_GENERATIVE_AI_API_KEY not provided" "$YELLOW"
fi

read -p "GROQ_API_KEY (optional, press Enter to skip): " GROQ_API_KEY

print_message "✅ Environment variables collected" "$GREEN"

echo ""

# ============================================
# Step 4: Build Docker Image Locally
# ============================================
print_message "🐳 Building Docker image locally..." "$YELLOW"

IMAGE_NAME="gcr.io/${GCP_PROJECT}/${SERVICE_NAME}"
IMAGE_TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

docker build \
    --build-arg NEXT_PUBLIC_CONVEX_URL="${CONVEX_URL}" \
    -t ${FULL_IMAGE} \
    .

if [ $? -eq 0 ]; then
    print_message "✅ Docker image built successfully" "$GREEN"
else
    print_message "❌ Docker build failed" "$RED"
    exit 1
fi

echo ""

# ============================================
# Step 5: Test Docker Image Locally (Optional)
# ============================================
print_message "🧪 Local Testing" "$YELLOW"
read -p "Do you want to test the Docker image locally before deploying? (y/n) [n]: " test_local
test_local=${test_local:-n}

if [[ "$test_local" == "y" || "$test_local" == "Y" ]]; then
    print_message "Starting container on http://localhost:8080..." "$BLUE"
    echo "Press Ctrl+C to stop the container when you're done testing."
    echo ""

    # Build env vars for docker run
    ENV_VARS="-e NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL}"
    [ ! -z "$CONVEX_DEPLOY_KEY" ] && ENV_VARS="$ENV_VARS -e CONVEX_DEPLOY_KEY=${CONVEX_DEPLOY_KEY}"
    [ ! -z "$OPENAI_API_KEY" ] && ENV_VARS="$ENV_VARS -e OPENAI_API_KEY=${OPENAI_API_KEY}"
    [ ! -z "$GOOGLE_API_KEY" ] && ENV_VARS="$ENV_VARS -e GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_API_KEY}"
    [ ! -z "$GROQ_API_KEY" ] && ENV_VARS="$ENV_VARS -e GROQ_API_KEY=${GROQ_API_KEY}"

    docker run -p 8080:3000 $ENV_VARS ${FULL_IMAGE}

    echo ""
    read -p "Continue with deployment? (y/n) [y]: " continue_deploy
    continue_deploy=${continue_deploy:-y}

    if [[ "$continue_deploy" != "y" && "$continue_deploy" != "Y" ]]; then
        print_message "Deployment cancelled." "$YELLOW"
        exit 0
    fi
fi

echo ""

# ============================================
# Step 6: Enable Required GCP APIs
# ============================================
print_message "🔧 Enabling required GCP APIs..." "$YELLOW"

gcloud services enable \
    containerregistry.googleapis.com \
    run.googleapis.com \
    --project=${GCP_PROJECT}

print_message "✅ APIs enabled" "$GREEN"

echo ""

# ============================================
# Step 7: Configure Docker for GCR
# ============================================
print_message "🔑 Configuring Docker for GCR..." "$YELLOW"

gcloud auth configure-docker --quiet

print_message "✅ Docker configured for GCR" "$GREEN"

echo ""

# ============================================
# Step 8: Push Image to GCR
# ============================================
print_message "📤 Pushing image to Google Container Registry..." "$YELLOW"

docker push ${FULL_IMAGE}

if [ $? -eq 0 ]; then
    print_message "✅ Image pushed successfully" "$GREEN"
else
    print_message "❌ Failed to push image" "$RED"
    exit 1
fi

echo ""

# ============================================
# Step 9: Deploy to Cloud Run
# ============================================
print_message "🚢 Deploying to Cloud Run..." "$YELLOW"

# Build env vars string for Cloud Run
ENV_VARS_STRING="NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL}"
[ ! -z "$CONVEX_DEPLOY_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},CONVEX_DEPLOY_KEY=${CONVEX_DEPLOY_KEY}"
[ ! -z "$OPENAI_API_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},OPENAI_API_KEY=${OPENAI_API_KEY}"
[ ! -z "$GOOGLE_API_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_API_KEY}"
[ ! -z "$GROQ_API_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},GROQ_API_KEY=${GROQ_API_KEY}"

gcloud run deploy ${SERVICE_NAME} \
    --image ${FULL_IMAGE} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars "${ENV_VARS_STRING}" \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --project ${GCP_PROJECT}

if [ $? -eq 0 ]; then
    echo ""
    print_message "✅ Deployment successful!" "$GREEN"
    echo ""

    # Get the service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --platform managed \
        --region ${REGION} \
        --format 'value(status.url)' \
        --project ${GCP_PROJECT})

    print_message "🌐 Your application is live at:" "$BLUE"
    print_message "   ${SERVICE_URL}" "$GREEN"
    echo ""
    print_message "📊 View logs:" "$BLUE"
    echo "   gcloud run logs read ${SERVICE_NAME} --region ${REGION} --project ${GCP_PROJECT}"
    echo ""
    print_message "📝 Update environment variables:" "$BLUE"
    echo "   gcloud run services update ${SERVICE_NAME} --region ${REGION} --update-env-vars KEY=VALUE"
else
    print_message "❌ Deployment failed" "$RED"
    exit 1
fi

echo ""
print_message "🎉 Deployment complete!" "$GREEN"
print_message "" "$NC"
print_message "⚠️  Remember:" "$YELLOW"
echo "  - Your Convex backend runs separately on Convex Cloud"
echo "  - Update Convex functions: npx convex deploy --prod"
echo "  - Frontend and backend communicate via NEXT_PUBLIC_CONVEX_URL"
