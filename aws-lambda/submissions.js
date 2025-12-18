// AWS Lambda function for managing submission history
// Deploy this to AWS Lambda and connect it to API Gateway

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'aces-submission-history';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getSubmissions(headers);
      case 'POST':
        return await saveSubmission(event, headers);
      case 'DELETE':
        return await deleteSubmission(event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function getSubmissions(headers) {
  const result = await dynamodb.scan({
    TableName: TABLE_NAME
  }).promise();

  // Convert DynamoDB items to the expected format
  const history = {};
  result.Items.forEach(item => {
    if (!history[item.templateId]) {
      history[item.templateId] = [];
    }
    history[item.templateId].push({
      partNumber: item.partNumber,
      brandCode: item.brandCode,
      brandName: item.brandName,
      partTypeId: item.partTypeId,
      partTypeName: item.partTypeName,
      date: item.date,
      timestamp: item.timestamp
    });
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, history })
  };
}

async function saveSubmission(event, headers) {
  const { templateId, records } = JSON.parse(event.body);

  if (!templateId || !records || !Array.isArray(records)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request body' })
    };
  }

  // Save each record to DynamoDB
  const promises = records.map(record => {
    return dynamodb.put({
      TableName: TABLE_NAME,
      Item: {
        id: `${templateId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        partNumber: record.partNumber,
        brandCode: record.brandCode,
        brandName: record.brandName,
        partTypeId: record.partTypeId,
        partTypeName: record.partTypeName,
        date: record.date,
        timestamp: record.timestamp
      }
    }).promise();
  });

  await Promise.all(promises);

  // Fetch updated history
  return await getSubmissions(headers);
}

async function deleteSubmission(event, headers) {
  const templateId = event.queryStringParameters?.templateId;

  if (!templateId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing templateId parameter' })
    };
  }

  // Query all items for this template
  const result = await dynamodb.query({
    TableName: TABLE_NAME,
    IndexName: 'templateId-index',
    KeyConditionExpression: 'templateId = :templateId',
    ExpressionAttributeValues: {
      ':templateId': templateId
    }
  }).promise();

  // Delete all items
  const deletePromises = result.Items.map(item => {
    return dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { id: item.id }
    }).promise();
  });

  await Promise.all(deletePromises);

  // Fetch updated history
  return await getSubmissions(headers);
}
