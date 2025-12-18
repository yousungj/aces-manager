#!/bin/bash

# ACES Manager - No IAM Check Version
# Assumes role 'aces-lambda-role' already exists

set -e

echo "🚀 Deploying ACES Manager Submission API..."

# Configuration
FUNCTION_NAME="aces-submission-api"
ROLE_NAME="aces-lambda-role"
TABLE_NAME="aces-submission-history"
REGION="us-east-1"
API_NAME="aces-submission-api"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "Using IAM role: $ROLE_ARN"

# Package Lambda function
echo "📦 Packaging Lambda function..."
cd "$(dirname "$0")"
zip -q function.zip submissions.js

# Create or update Lambda function
echo "⚡ Deploying Lambda function..."
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
  echo "🔄 Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip
  
  aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment "Variables={DYNAMODB_TABLE=${TABLE_NAME}}"
else
  echo "✨ Creating new Lambda function..."
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --role $ROLE_ARN \
    --handler submissions.handler \
    --zip-file fileb://function.zip \
    --environment "Variables={DYNAMODB_TABLE=${TABLE_NAME}}" \
    --timeout 30
fi

rm function.zip
echo "✅ Lambda function deployed!"

# Create API Gateway
echo "🌐 Setting up API Gateway..."

API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${API_NAME}'].id" --output text)

if [ -z "$API_ID" ]; then
  API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "ACES Manager Submission API" \
    --query 'id' \
    --output text)
  echo "Created API with ID: $API_ID"
else
  echo "Using existing API with ID: $API_ID"
fi

ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/`].id' \
  --output text)

RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query "items[?pathPart=='submissions'].id" \
  --output text)

if [ -z "$RESOURCE_ID" ]; then
  RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part submissions \
    --query 'id' \
    --output text)
  echo "Created /submissions resource"
fi

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

for METHOD in GET POST DELETE OPTIONS; do
  echo "Setting up $METHOD method..."
  
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --authorization-type NONE 2>/dev/null || true
  
  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" 2>/dev/null || true
done

echo "Setting up CORS..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":true,"method.response.header.Access-Control-Allow-Methods":true,"method.response.header.Access-Control-Allow-Origin":true}' 2>/dev/null || true

echo "Granting API Gateway permission to invoke Lambda..."
aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" 2>/dev/null || echo "Permission already exists"

echo "🚀 Deploying API to production..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod 2>/dev/null || true

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Your API URL:"
echo "   $API_URL"
echo ""
echo "📝 Next step - Create .env.local file:"
echo "   echo 'NEXT_PUBLIC_API_URL=$API_URL' > ../../.env.local"
echo ""
echo "🧪 Test your API:"
echo "   curl $API_URL/submissions"
echo ""
