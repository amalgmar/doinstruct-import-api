import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler as importHandler } from "../import";
import { APIGatewayProxyEvent } from "aws-lambda";

vi.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: vi.fn(() => ({
            send: vi.fn(async (command: any) => {
                if (command.constructor.name === "BatchWriteCommand") {
                    return { UnprocessedItems: {} };
                }
                if (command.constructor.name === "PutCommand") {
                    return {};
                }
                return {};
            }),
        })),
    },
    BatchWriteCommand: vi.fn(),
    PutCommand: vi.fn(),
}));

describe("Import Handler Integration Test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully import 2 employees", async () => {
        const event = {
            body: JSON.stringify({
                accountId: "integration-test-customer",
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
