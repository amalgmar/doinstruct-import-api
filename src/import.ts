// src/import.ts
import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

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
                body: JSON.stringify({ message: "Invalid payload" }),
            };
        }

        const importId = uuidv4();
        const seenIds = new Set();
        const seenPhones = new Set();
        const validEmployees: Employee[] = [];
        const errors: any[] = [];

        for (const employee of employees) {
            const { employeeId, firstName, lastName, phone } = employee as Employee;

            if (!employeeId || !firstName || !lastName || seenIds.has(employeeId)) {
                errors.push({ employeeId, reason: "Invalid or duplicate employeeId" });
                continue;
            }
            if (phone && seenPhones.has(phone)) {
                errors.push({ employeeId, reason: "Duplicate phone number" });
                continue;
            }

            seenIds.add(employeeId);
            if (phone) seenPhones.add(phone);

            validEmployees.push({
                employeeId,
                firstName,
                lastName,
                phone,
            });
        }

        // Batch Write to Employees Table
        const batches = [];
        for (let i = 0; i < validEmployees.length; i += 25) {
            const batch = validEmployees.slice(i, i + 25).map((emp) => ({
                PutRequest: {
                    Item: {
                        accountId,
                        employeeId: emp.employeeId,
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        phone: emp.phone || null,
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
                totalReceived: employees.length,
                totalValid: validEmployees.length,
                totalErrors: errors.length,
                errors,
            }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};
