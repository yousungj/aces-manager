#!/bin/bash

# ACES Manager - AWS Lambda Deployment Script
# This script deploys the Lambda function and creates API Gateway

set -e

echo "🚀 Deploying ACES Manager Submission API..."

# Configuration
FUNCTION_NAME="aces-submission-api"
ROLE_NAME="aces-lambda-role"
TABLE_NAME="aces-submission-history"
REGION="us-east-1"  # Change if needed
API_NAME="aces-submission-api"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"

# Step 1: Create IAM role for Lambda (if doesn't exist)
echo "📝 Creating IAM role..."
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' 2>/dev/null || echo "Role already exists"

# Attach DynamoDB policy
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name DynamoDBAccess \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Effect\": \"Allow\",
      \"Action\": [
        \"dynamodb:PutItem\",
        \"dynamodb:GetItem\",
        \"dynamodb:Scan\",
        \"dynamodb:Query\",
        \"dynamodb:DeleteItem\"
      ],
      \"Resource\": [
        \"arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}\",
        \"arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}/index/*\"
      ]
    }]
  }"

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true

echo "⏳ Waiting for IAM role to be ready..."
sleep 10

# Step 2: Package Lambda function
echo "📦 Packaging Lambda function..."
cd "$(dirname "$0")"
zip -q function.zip submissions.js

# Step 3: Create or update Lambda function
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

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

# Clean up
rm function.zip

# Step 4: Create API Gateway
echo "🌐 Setting up API Gateway..."

# Create REST API
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

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/`].id' \
  --output text)

# Create /submissions resource (if doesn't exist)
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
fi

# Lambda ARN
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

# Create methods (GET, POST, DELETE, OPTIONS)
for METHOD in GET POST DELETE OPTIONS; do
  echo "Creating $METHOD method..."
  
  # Create method
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --authorization-type NONE 2>/dev/null || true
  
  # Set up Lambda integration
  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" 2>/dev/null || true
done

# Enable CORS
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":true,"method.response.header.Access-Control-Allow-Methods":true,"method.response.header.Access-Control-Allow-Origin":true}' 2>/dev/null || true

# Give API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" 2>/dev/null || echo "Permission already exists"

# Deploy API
echo "🚀 Deploying API to production..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod 2>/dev/null || true

# Get API URL
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Your API URL:"
echo "   $API_URL"
echo ""
echo "📝 Next step:"
echo "   Add this to your .env.local file:"
echo ""
echo "   NEXT_PUBLIC_API_URL=$API_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Test your API:"
echo "   curl $API_URL/submissions"
echo ""
