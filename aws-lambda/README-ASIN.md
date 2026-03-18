# ASIN Lookup Lambda Function Setup

## Overview
This Lambda function integrates with Amazon Selling Partner API (SP-API) to:
1. Lookup part numbers from ASIN
2. Check ACES fitment status on Amazon
3. Return vehicle count and fitment data

## Prerequisites

### 1. Amazon SP-API Credentials
You need to register for SP-API access in Amazon Seller Central:

1. Go to [Seller Central](https://sellercentral.amazon.com/)
2. Navigate to **Apps & Services** → **Develop Apps**
3. Click **Add new app client**
4. Fill in:
   - **App Name**: ACES Manager ASIN Checker
   - **OAuth Redirect URI**: Leave blank (we use refresh token flow)
   - **IAM ARN**: Leave blank (not needed for this flow)
5. Click **Save and get credentials**

You'll get:
- **LWA Client ID** (looks like: `amzn1.application-oa2-client.xxxxx`)
- **LWA Client Secret** (looks like: `amzn1.oa2-cs.v1.xxxxx`)

### 2. Get Refresh Token

Follow Amazon's [Self Authorization guide](https://developer-docs.amazon.com/sp-api/docs/self-authorization):

1. Construct authorization URL:
```
https://sellercentral.amazon.com/apps/authorize/consent?application_id=YOUR_CLIENT_ID&version=beta
```

2. Visit the URL and authorize your app
3. You'll be redirected to a page with the **Refresh Token**
4. Save this token securely

## Deployment Steps

### Option 1: Deploy via AWS Console

1. **Create Lambda Function**
   - Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
   - Click **Create function**
   - Choose **Author from scratch**
   - Function name: `asin-lookup`
   - Runtime: **Node.js 18.x** or later
   - Click **Create function**

2. **Upload Code**
   - Copy the contents of `asin-lookup.js`
   - Paste into the Lambda function code editor
   - Click **Deploy**

3. **Set Environment Variables**
   - Go to **Configuration** → **Environment variables**
   - Click **Edit** → **Add environment variable**
   - Add these variables:
     ```
     SP_API_CLIENT_ID = amzn1.application-oa2-client.xxxxx
     SP_API_CLIENT_SECRET = amzn1.oa2-cs.v1.xxxxx
     SP_API_REFRESH_TOKEN = Atzr|xxxxx
     MARKETPLACE_ID = ATVPDKIKX0DER (for US)
     ```
   - Click **Save**

4. **Configure Function**
   - Go to **Configuration** → **General configuration**
   - Click **Edit**
   - Set **Timeout** to **30 seconds**
   - Set **Memory** to **512 MB**
   - Click **Save**

5. **Add API Gateway Trigger**
   - Go to **Function overview**
   - Click **Add trigger**
   - Choose **API Gateway**
   - Create **REST API**
   - Security: **Open** (or configure API key)
   - Click **Add**
   - Copy the **API endpoint URL**

6. **Enable CORS** (if using from browser)
   - Go to API Gateway console
   - Select your API
   - Enable CORS for POST method
   - Deploy API

### Option 2: Deploy via CLI

```bash
# Package the function
cd aws-lambda
zip -r asin-lookup.zip asin-lookup.js

# Create the function (first time only)
aws lambda create-function \
  --function-name asin-lookup \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler asin-lookup.handler \
  --zip-file fileb://asin-lookup.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    SP_API_CLIENT_ID=YOUR_CLIENT_ID,
    SP_API_CLIENT_SECRET=YOUR_CLIENT_SECRET,
    SP_API_REFRESH_TOKEN=YOUR_REFRESH_TOKEN,
    MARKETPLACE_ID=ATVPDKIKX0DER
  }"

# Update existing function
aws lambda update-function-code \
  --function-name asin-lookup \
  --zip-file fileb://asin-lookup.zip
```

## Configure Frontend

After deploying the Lambda function:

1. Get your Lambda API Gateway URL (e.g., `https://xxxxx.execute-api.us-east-1.amazonaws.com/default/asin-lookup`)

2. Set environment variable in your Next.js app:
   - For local development, add to `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/default
     ```
   
   - For AWS Amplify deployment:
     - Go to **AWS Amplify Console**
     - Select your app
     - Go to **Environment variables**
     - Add: `NEXT_PUBLIC_API_URL` = `https://xxxxx.execute-api.us-east-1.amazonaws.com/default`

3. Redeploy your app

## Testing

### Test Lambda Function Directly

```bash
# Create test event in Lambda console
{
  "httpMethod": "POST",
  "body": "{\"asin\":\"B0ABCD1234\"}"
}
```

### Test via API

```bash
curl -X POST https://YOUR_API_URL/asin-lookup \
  -H "Content-Type: application/json" \
  -d '{"asin":"B0ABCD1234"}'
```

Expected response:
```json
{
  "success": true,
  "asin": "B0ABCD1234",
  "partNumber": "MT-123-BDK",
  "fitmentStatus": {
    "hasAces": true,
    "vehicleCount": 123,
    "status": "LIVE",
    "lastChecked": "2025-12-22T10:30:00.000Z"
  },
  "rawData": {
    "productTitle": "BDK Mega Mat Floor Mat",
    "brand": "BDK"
  }
}
```

## Troubleshooting

### "No access token received"
- Verify your SP-API credentials are correct
- Make sure refresh token hasn't expired
- Check that you've authorized the correct scopes

### "Invalid ASIN format"
- ASIN must be exactly 10 characters
- Must start with 'B'
- Only alphanumeric characters

### "No fitment data found"
- Product may not have ACES data uploaded yet
- Processing can take 24-48 hours after upload
- Some products may not support fitment data

### Lambda timeout
- Increase timeout to 30-60 seconds
- SP-API calls can be slow during peak times

## Cost Estimate

- Lambda: ~$0.0000002 per request (essentially free for typical use)
- API Gateway: $3.50 per million requests
- SP-API: Free (included with Seller Central account)

For 1000 ASIN lookups/month: ~$0.004/month

## Security Notes

- ⚠️ **NEVER** commit your SP-API credentials to Git
- Store credentials in Lambda environment variables only
- Consider using AWS Secrets Manager for production
- Implement rate limiting if making public
- Use API keys to prevent abuse

## SP-API Rate Limits

- Catalog Items API: 5 requests per second
- This Lambda handles one ASIN at a time
- Add queuing if doing bulk lookups

## Next Steps

1. Get your SP-API credentials from Seller Central
2. Deploy the Lambda function
3. Configure environment variables
4. Test with a real ASIN
5. Set `NEXT_PUBLIC_API_URL` in Amplify
6. Deploy your frontend

🎉 You're ready to check ACES fitment status!
