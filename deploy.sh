#!/bin/bash

# Social Media Post Generator - Vercel Deployment Script
echo "🚀 Deploying Social Media Post Generator to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Deploy the project
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to set your environment variables in the Vercel dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - GEMINI_API_KEY"

