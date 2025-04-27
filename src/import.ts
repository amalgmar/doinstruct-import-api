import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBDocumentClient, BatchWriteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE!;
const IMPORTREPORTS_TABLE = process.env.IMPORTREPORTS_TABLE!;

interface Employee {
    employeeId: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const { accountId, employees } = body;

        if (!accountId || !Array.isArray(employees)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid payload structure" }),
            };
        }

        if (employees.length > 10000) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Maximum of 10,000 employees allowed per import" }),
            };
        }

        const importId = uuidv4();
        const seenIds = new Set<string>();
        const seenPhones = new Set<string>();
        const validEmployees: Employee[] = [];
        const errors: { employeeId: string; reason: string }[] = [];

        for (const emp of employees) {
            const { employeeId, firstName, lastName, phone } = emp as Employee;

            if (!employeeId || !firstName || !lastName || seenIds.has(employeeId)) {
                errors.push({ employeeId: employeeId || "unknown", reason: "Invalid or duplicate employeeId" });
                continue;
            }

            if (phone) {
                const parsedPhone = parsePhoneNumberFromString(phone);
                if (!parsedPhone?.isValid()) {
                    errors.push({ employeeId, reason: "Invalid phone number format" });
                    continue;
                }
                if (seenPhones.has(phone)) {
                    errors.push({ employeeId, reason: "Duplicate phone number" });
                    continue;
                }
                seenPhones.add(phone);
            }

            seenIds.add(employeeId);

            validEmployees.push({
                employeeId,
                firstName,
                lastName,
                phone,
            });
        }

        // Batch write (safely, max 25 per batch)
        const batches = [];
        for (let i = 0; i < validEmployees.length; i += 25) {
            const batch = validEmployees.slice(i, i + 25).map((emp) => ({
                PutRequest: {
                    Item: {
                        accountId,
                        employeeId: emp.employeeId,
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        phone: emp.phone ?? null,
                    },
                },
            }));
            batches.push(batch);
        }

        for (const batch of batches) {
            await client.send(
                new BatchWriteCommand({
                    RequestItems: {
                        [EMPLOYEES_TABLE]: batch,
                    },
                })
            );
        }

        // Save import summary
        await client.send(
            new PutCommand({
                TableName: IMPORTREPORTS_TABLE,
                Item: {
                    importId,
                    accountId,
                    importedCount: validEmployees.length,
                    errorCount: errors.length,
                    errors,
                    createdAt: new Date().toISOString(),
                },
            })
        );

        return {
            statusCode: 202,
            body: JSON.stringify({
                importId,
                message: "Import processed successfully",
                totalReceived: employees.length,
                totalValid: validEmployees.length,
                totalErrors: errors.length,
            }),
        };
    } catch (error) {
        console.error("Error during import:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: (error as Error).message }),
        };
    }
};
