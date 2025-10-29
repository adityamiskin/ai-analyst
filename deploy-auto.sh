#!/bin/bash

# ============================================
# AI Analyst - Automated Cloud Run Deployment
# Uses environment variables from .env.local
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
REGION="us-central1"
SERVICE_NAME="ai-analyst"

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

print_message "🚀 AI Analyst - Automated Cloud Run Deployment" "$BLUE"
echo ""

# ============================================
# Load environment variables from .env.local
# ============================================
if [ -f .env.local ]; then
    print_message "📋 Loading environment variables from .env.local..." "$YELLOW"
    # Load env vars, removing inline comments
    set -a
    source <(cat .env.local | sed 's/#.*//' | sed '/^$/d')
    set +a
    print_message "✅ Environment variables loaded" "$GREEN"
else
    print_message "❌ .env.local file not found!" "$RED"
    exit 1
fi

# Validate required variables
if [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
    print_message "❌ NEXT_PUBLIC_CONVEX_URL not found in .env.local" "$RED"
    exit 1
fi

print_message "Using Convex URL: $NEXT_PUBLIC_CONVEX_URL" "$BLUE"

echo ""

# ============================================
# Get GCP Project from gcloud config
# ============================================
GCP_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ -z "$GCP_PROJECT" ]; then
    print_message "❌ No GCP project configured. Run: gcloud config set project PROJECT_ID" "$RED"
    exit 1
fi

print_message "✅ Using GCP project: $GCP_PROJECT" "$GREEN"

echo ""

# ============================================
# Build Docker Image
# ============================================
print_message "🐳 Building Docker image..." "$YELLOW"

IMAGE_NAME="gcr.io/${GCP_PROJECT}/${SERVICE_NAME}"
IMAGE_TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

docker build \
    --build-arg NEXT_PUBLIC_CONVEX_URL="${NEXT_PUBLIC_CONVEX_URL}" \
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
# Enable Required GCP APIs
# ============================================
print_message "🔧 Enabling required GCP APIs..." "$YELLOW"

gcloud services enable \
    containerregistry.googleapis.com \
    run.googleapis.com \
    --project=${GCP_PROJECT}

print_message "✅ APIs enabled" "$GREEN"

echo ""

# ============================================
# Configure Docker for GCR
# ============================================
print_message "🔑 Configuring Docker for GCR..." "$YELLOW"

gcloud auth configure-docker --quiet

print_message "✅ Docker configured for GCR" "$GREEN"

echo ""

# ============================================
# Push Image to GCR
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
# Deploy to Cloud Run
# ============================================
print_message "🚢 Deploying to Cloud Run..." "$YELLOW"

# Build env vars string for Cloud Run
ENV_VARS_STRING="NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}"
[ ! -z "$CONVEX_DEPLOY_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},CONVEX_DEPLOY_KEY=${CONVEX_DEPLOY_KEY}"
[ ! -z "$OPENAI_API_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},OPENAI_API_KEY=${OPENAI_API_KEY}"
[ ! -z "$GOOGLE_GENERATIVE_AI_API_KEY" ] && ENV_VARS_STRING="${ENV_VARS_STRING},GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}"
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
else
    print_message "❌ Deployment failed" "$RED"
    exit 1
fi

echo ""
print_message "🎉 Deployment complete!" "$GREEN"
