import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const IMPORTREPORTS_TABLE = process.env.IMPORTREPORTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
    const importId = event.pathParameters?.importId;

    if (!importId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing importId in path" }),
        };
    }

    try {
        const result = await client.send(
            new GetCommand({
                TableName: IMPORTREPORTS_TABLE,
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
    } catch (error) {
        console.error("Error fetching report:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: (error as Error).message }),
        };
    }
};
