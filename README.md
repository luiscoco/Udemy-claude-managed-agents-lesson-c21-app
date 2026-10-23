# C21 · Designing Tools the Model Uses Well

Creates a local refund proposal and checks replay fingerprints. No payment operation exists in the application. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Precise tool descriptions and integer cents
- Proposal is not payment
- Stable action key and fingerprint

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3021`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3021
```

## How the app was build

### 1. Validate a proposal in integer cents

The host accepts only the seeded eligible order, a whole-cent amount within its cap and a bounded nonempty reason. A model cannot set its own refundable limit.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
const amount = number(input, "amountCents"),
  reason = text(input, "reason").trim();

if (
  text(input, "orderId") !== "ORD-1001" ||
  !Number.isSafeInteger(amount) ||
  amount < 1 ||
  amount > 2500 ||
  !reason ||
  reason.length > 200
)
  return report(
    "rejected",
    "Order eligibility, cents, or reason is invalid",
    { proposalCount: 0 },
    [
      "Validate exact tool schema",
      "Load the owned damaged order",
      "Check refundable cents",
    ],
  );
```

### 2. Detect a conflicting replay

The pending proposal is fingerprinted. Replaying the same action with a different amount produces conflict instead of a second proposal.

Source: [src/lesson.ts](src/lesson.ts#L15) · selected statements

```typescript
const proposal = {
  orderId: "ORD-1001",
  amountCents: amount,
  reason,
  status: "PENDING",
};

const fingerprint = hash(JSON.stringify(proposal));

if (number(input, "replayAmountCents") !== amount)
  return report(
    "conflict",
    "The same action key was replayed with different proposal content",
    { proposalCount: 1, fingerprint },
    ["Insert the pending proposal once", "Reject a conflicting replay"],
  );
```

### 3. Return a proposal without issuing payment

An identical replay retains one pending proposal. paymentIssued is false: financial execution would require a separate authorized operation, and this sample has no persistent payment ledger.

Source: [src/lesson.ts](src/lesson.ts#L18)

```typescript
return report(
  "passed",
  "Returned the same pending proposal for an identical replay",
  { ...proposal, proposalCount: 1, fingerprint, paymentIssued: false },
  [
    "Reserve a stable host action key",
    "Hash the proposal",
    "Deduplicate identical requests",
    "Require a separate authorized refund operation",
  ],
);
```

### Check your understanding

Run **Create a pending proposal** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "orderId": "ORD-1001",
    "amountCents": 1999,
    "reason": "Damaged item",
    "replayAmountCents": 1999
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "status": "PENDING",
    "proposalCount": 1
  }
}
```

Then try **Detect conflicting replay**. Its expected outcome is `conflict`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
