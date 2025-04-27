import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler as reportHandler } from "../report";
import { APIGatewayProxyEvent } from "aws-lambda";

vi.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: vi.fn(() => ({
            send: vi.fn(async () => {
                return {
                    Item: {
                        importId: "mock-import",
                        importedCount: 2,
                        errorCount: 0,
                    },
                };
            }),
        })),
    },
    GetCommand: vi.fn(),
}));

describe("Report Handler Integration Test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch a report with 2 employees imported", async () => {
        const event = {
            pathParameters: {
                importId: "mock-import",
            },
        } as unknown as APIGatewayProxyEvent;

        const result = await reportHandler(event, null as any, null as any) as {
            statusCode: number;
            body: string;
        };

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.importedCount).toBe(2);
        expect(body.errorCount).toBe(0);
    });
});
