import fetch from "node-fetch";

const API_URL = "https://u8s4826x6b.execute-api.us-east-1.amazonaws.com/import";

const generateEmployees = (start, count) => {
    const employees = [];
    for (let i = start; i < start + count; i++) {
        employees.push({
            employeeId: `emp-${i}`,
            firstName: `FirstName${i}`,
            lastName: `LastName${i}`,
            phone: `+123456789${String(i).padStart(4, "0")}`,
        });
    }
    return employees;
};

const runLoadTest = async () => {
    console.log("🚀 Starting Load Test: Sending 10 batches of 1,000 employees...");

    const startTime = Date.now();

    for (let batch = 0; batch < 10; batch++) {
        const employees = generateEmployees(batch * 1000, 1000);

        const body = {
            accountId: `load-test-customer-batch-${batch}`,
            employees,
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Error Response for Batch ${batch}:`, text);
            continue;
        }

        const result = await response.json();
        console.log(`✅ Batch ${batch + 1} done. ImportId: ${result.importId}`);
    }

    const endTime = Date.now();
    console.log("✅ Load Test Finished!");
    console.log("Total Duration:", (endTime - startTime) + "ms");
};

runLoadTest().catch((err) => {
    console.error("❌ Load Test Failed:", err);
});
