// src/import.ts
import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

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

        if (employees.length > 10000) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Employee batch too large" }),
            };
        }

        const importId = uuidv4(); // generate a new import session ID

        // Basic validation
        const seenIds = new Set();
        const seenPhones = new Set();
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

            // 🛠 Here later we will save into DynamoDB
        }

        return {
            statusCode: 202,
            body: JSON.stringify({
                importId,
                totalReceived: employees.length,
                totalValid: employees.length - errors.length,
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
