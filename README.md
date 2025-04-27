# doinstruct-import-api

A serverless backend API built with SST v2, AWS Lambda, DynamoDB, and TypeScript for importing and managing employees at scale.

## 📋 Features

- Import up to 10,000 employees per request.
- Real-time validation (unique Employee IDs and Phone Numbers).
- Asynchronous scalable architecture using DynamoDB batch writes.
- Structured Import Reports retrievable via API.
- Full unit tests, integration tests, and load test simulation (10,000 employees).
- CI/CD via GitHub Actions (lint + test on every push).

## ⚙️ Tech Stack

- SST v2
- AWS Lambda
- AWS DynamoDB
- AWS API Gateway
- TypeScript
- Vitest
- ESLint
- GitHub Actions

## 🚀 API Endpoints

### POST `/import`

Accepts employee records (up to 10,000 per request), validates input, and returns an `importId` to track the import status.

**Example Request:**

```json
{
  "accountId": "customer1",
  "employees": [
    { "employeeId": "e1", "firstName": "John", "lastName": "Doe" },
    { "employeeId": "e2", "firstName": "Jane", "lastName": "Smith" }
  ]
}
```

**Example Response:**

```json
{
  "importId": "uuid-generated",
  "message": "Import processed successfully",
  "totalReceived": 2,
  "totalValid": 2,
  "totalErrors": 0
}
```

---

### GET `/report/{importId}`

Retrieves the import report showing the number of imported employees and any validation errors.

**Example Response:**

```json
{
  "importId": "uuid",
  "accountId": "customer1",
  "importedCount": 2,
  "errorCount": 0,
  "errors": []
}
```

---

## 💻 How to Run Locally

```bash
npm install
npx sst dev
```

The local API URL will be shown after running.

---

## 🚀 How to Deploy to AWS

```bash
npx sst deploy
```

---

## 🧪 How to Run Tests

```bash
npm run test
```

Runs all unit and integration tests with Vitest.

---

## 🔥 How to Run Load Test

```bash
npm run load-test
```

Simulates importing 10,000 employees across 10 batches.

---

## ✅ CI/CD

- GitHub Actions automatically runs:
    - `npm run lint`
    - `npm run test`
- On every `push` and `pull_request`.

Ensures code is clean, tested, and safe to deploy.

---

## 🚀 Production-Ready Scaling Ideas (Future)

- Decouple ingestion using **SQS Queues** for better async scaling.
- Implement **Dead Letter Queues (DLQ)** for handling failures.
- Use **Idempotency Keys** to handle retries safely.
- Add **DynamoDB Global Tables** for multi-region resilience and disaster recovery.

---

## ✨ Author

**Amal Gmar**
