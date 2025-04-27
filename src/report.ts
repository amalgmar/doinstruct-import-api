// src/report.ts
import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
    const importId = event.pathParameters?.importId;

    if (!importId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing importId" }),
        };
    }

    // 🛠 Here later we would fetch from DynamoDB
    return {
        statusCode: 200,
        body: JSON.stringify({
            importId,
            status: "Processed",
            importedCount: 9500,
            errorCount: 500,
            errors: [],
        }),
    };
};
