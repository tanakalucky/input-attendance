import { APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(dynamodbClient);

export const handler = async (): Promise<{ id: string; title: string }[]> => {
  const command = new ScanCommand({
    TableName: process.env.TABLE_NAME,
  });

  const { Items } = await docClient.send(command);
  const items =
    Items?.map((item): { id: string; title: string } => {
      return {
        id: item.Id ?? '',
        title: item.Title ?? '',
      };
    }) ?? [];

  return items;
};
