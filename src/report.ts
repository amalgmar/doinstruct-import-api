// src/report.ts
import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const IMPORT_REPORTS_TABLE = process.env.IMPORTREPORTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
    const importId = event.pathParameters?.importId;

    if (!importId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing importId" }),
        };
    }

    const result = await client.send(
        new GetCommand({
            TableName: IMPORT_REPORTS_TABLE,
            Key: { importId },
        })
    );

    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Import report not found" }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
    };
};
