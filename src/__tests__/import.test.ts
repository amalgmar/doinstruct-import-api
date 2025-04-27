import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler as importHandler } from "../import";
import { APIGatewayProxyEvent } from "aws-lambda";

// ✅ Proper DynamoDBClient Mock
vi.mock("@aws-sdk/lib-dynamodb", () => {
    return {
        DynamoDBDocumentClient: {
            from: vi.fn(() => ({
                send: vi.fn().mockResolvedValue({}) // ✅ Mock send() always resolves
            })),
        },
        BatchWriteCommand: vi.fn(),
        PutCommand: vi.fn(),
    };
});

describe("Import Handler Unit Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 if payload is invalid", async () => {
        const event = { body: "{}" } as unknown as APIGatewayProxyEvent;
        const result = await importHandler(event, null as any, null as any) as {
            statusCode: number;
            body: string;
        };
        expect(result.statusCode).toBe(400);
        expect(result.body).toContain("Invalid payload structure");
    });

    it("should return 400 if more than 10,000 employees", async () => {
        const event = {
            body: JSON.stringify({
                accountId: "customer1",
                employees: new Array(10001).fill({ employeeId: "e1", firstName: "John", lastName: "Doe" }),
            }),
        } as unknown as APIGatewayProxyEvent;
        const result = await importHandler(event, null as any, null as any) as {
            statusCode: number;
            body: string;
        };
        expect(result.statusCode).toBe(400);
        expect(result.body).toContain("Maximum of 10,000 employees allowed per import");
    });

    it("should return 202 for valid import", async () => {
        const event = {
            body: JSON.stringify({
                accountId: "customer1",
                employees: [
                    { employeeId: "e1", firstName: "John", lastName: "Doe" },
                    { employeeId: "e2", firstName: "Jane", lastName: "Smith" },
                ],
            }),
        } as unknown as APIGatewayProxyEvent;
        const result = await importHandler(event, null as any, null as any) as {
            statusCode: number;
            body: string;
        };
        expect(result.statusCode).toBe(202);
        expect(result.body).toContain("Import processed successfully");
    });
});
