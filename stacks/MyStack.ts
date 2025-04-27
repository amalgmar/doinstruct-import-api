import { StackContext, Api, Table } from "sst/constructs";

export function API({ stack }: StackContext) {
    // Employees Table
    const employeesTable = new Table(stack, "Employees", {
        fields: {
            accountId: "string",
            employeeId: "string",
        },
        primaryIndex: { partitionKey: "accountId", sortKey: "employeeId" },
    });

    // Import Reports Table
    const reportTable = new Table(stack, "ImportReports", {
        fields: {
            importId: "string",
        },
        primaryIndex: { partitionKey: "importId" },
    });

    // API Gateway
    const api = new Api(stack, "Api", {
        routes: {
            "POST /import": "src/import.handler",
            "GET /report/{importId}": "src/report.handler",
        },
    });

    // Grant API access to the tables
    api.attachPermissions([employeesTable, reportTable]);

    // Outputs
    stack.addOutputs({
        ApiEndpoint: api.url,
    });
}
