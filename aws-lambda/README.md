# AWS Setup for Submission History

## Step 1: Create DynamoDB Table

1. Go to AWS DynamoDB Console
2. Create table with:
   - Table name: `aces-submission-history`
   - Partition key: `id` (String)
   - Create a Global Secondary Index:
     - Index name: `templateId-index`
     - Partition key: `templateId` (String)

## Step 2: Create Lambda Function

1. Go to AWS Lambda Console
2. Create function:
   - Name: `aces-submission-api`
   - Runtime: Node.js 18.x or later
   - Upload `aws-lambda/submissions.js`
3. Set environment variables:
   - `DYNAMODB_TABLE`: `aces-submission-history`
4. Attach IAM role with DynamoDB permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:PutItem",
           "dynamodb:GetItem",
           "dynamodb:Scan",
           "dynamodb:Query",
           "dynamodb:DeleteItem"
         ],
         "Resource": [
           "arn:aws:dynamodb:*:*:table/aces-submission-history",
           "arn:aws:dynamodb:*:*:table/aces-submission-history/index/*"
         ]
       }
     ]
   }
   ```

## Step 3: Create API Gateway

1. Go to API Gateway Console
2. Create REST API
3. Create resource: `/submissions`
4. Create methods:
   - `GET` → Lambda: `aces-submission-api`
   - `POST` → Lambda: `aces-submission-api`
   - `DELETE` → Lambda: `aces-submission-api`
   - `OPTIONS` → Lambda: `aces-submission-api` (for CORS)
5. Enable CORS
6. Deploy API to a stage (e.g., `prod`)
7. Copy the Invoke URL (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

## Step 4: Update Frontend

Add the API URL to your environment variables:

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

The frontend code in `page.tsx` is already configured to use:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

## Cost Estimate

- DynamoDB: Free tier includes 25 GB storage + 25 RCU/WCU
- Lambda: Free tier includes 1M requests/month
- API Gateway: Free tier includes 1M calls/month

Estimated cost: **$0/month** for typical usage (under free tier limits)

## Testing Locally

For local development, the app will fall back to localStorage if the API is not configured.
