import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler as reportHandler } from "../report";
import { APIGatewayProxyEvent } from "aws-lambda";

// Mock DynamoDB Client
vi.mock("@aws-sdk/lib-dynamodb", () => {
    return {
        DynamoDBDocumentClient: {
            from: vi.fn(() => ({
                send: vi.fn().mockResolvedValue({ Item: { importId: "mock-id" } })
            })),
        },
        GetCommand: vi.fn(),
    };
});


describe("Report Handler Unit Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 if importId is missing", async () => {
        const event = {} as unknown as APIGatewayProxyEvent;

        const result = await reportHandler(event, null as any, null as any) as {
            statusCode: number;
            body: string;
        };


        expect(result.statusCode).toBe(400);
        expect(result.body).toContain("Missing importId");
    });
});
