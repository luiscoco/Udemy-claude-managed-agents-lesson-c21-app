import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 21,
  title: "Designing Tools the Model Uses Well",
  description: "A custom tool is a contract between the model and your host. Its name, description, and input schema explain the available operation and how to request it.",
  concepts: ["Precise tool descriptions and integer cents", "Proposal is not payment", "Stable action key and fingerprint"],
  scope: "Creates a local refund proposal and checks replay fingerprints. No payment operation exists in the application. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Create a pending proposal", "input": {"orderId": "ORD-1001", "amountCents": 1999, "reason": "Damaged item", "replayAmountCents": 1999}, "expected": "passed", "checks": {"status": "PENDING", "proposalCount": 1}}, {"id": "1", "label": "Detect conflicting replay", "input": {"orderId": "ORD-1001", "amountCents": 1999, "reason": "Damaged item", "replayAmountCents": 2000}, "expected": "conflict", "checks": {"proposalCount": 1}}, {"id": "2", "label": "Reject an excessive proposal", "input": {"orderId": "ORD-1001", "amountCents": 9000, "reason": "Damaged item", "replayAmountCents": 9000}, "expected": "rejected", "checks": {"proposalCount": 0}}],
  async run(input) {

const amount=number(input,"amountCents"), reason=text(input,"reason").trim();
if(text(input,"orderId")!=="ORD-1001"||!Number.isSafeInteger(amount)||amount<1||amount>2500||!reason||reason.length>200)return report("rejected","Order eligibility, cents, or reason is invalid",{proposalCount:0},["Validate exact tool schema","Load the owned damaged order","Check refundable cents"]);
const proposal={orderId:"ORD-1001",amountCents:amount,reason,status:"PENDING"};
const fingerprint=hash(JSON.stringify(proposal));
if(number(input,"replayAmountCents")!==amount)return report("conflict","The same action key was replayed with different proposal content",{proposalCount:1,fingerprint},["Insert the pending proposal once","Reject a conflicting replay"]);
return report("passed","Returned the same pending proposal for an identical replay",{...proposal,proposalCount:1,fingerprint,paymentIssued:false},["Reserve a stable host action key","Hash the proposal","Deduplicate identical requests","Require a separate authorized refund operation"]);

  }
};
