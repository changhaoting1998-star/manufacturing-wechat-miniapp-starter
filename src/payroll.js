const { assertDomain } = require("./errors");
const { employeeForActor } = require("./attendance");
const { sha256 } = require("./crypto");

function listPayroll(store, actor) {
  const employee = employeeForActor(store, actor);
  return [...store.payroll.values()]
    .filter((item) => item.employeeId === employee.id && item.published)
    .map((item) => ({
      id: item.id,
      periodType: item.periodType,
      periodKey: item.periodKey,
      amount: item.amount,
      currency: item.currency,
      acknowledgedAt: item.acknowledgedAt || null,
    }));
}

function acknowledgePayroll(store, actor, payrollId, input, now) {
  const employee = employeeForActor(store, actor);
  const item = store.payroll.get(payrollId);
  assertDomain(item && item.published, "PAYROLL_NOT_FOUND", "Published payroll notice does not exist");
  assertDomain(item.employeeId === employee.id, "FORBIDDEN", "Payroll notice belongs to another employee");
  if (item.acknowledgedAt) return { id: item.id, acknowledgedAt: item.acknowledgedAt, replayed: true };
  if (item.periodType === "month") {
    assertDomain(typeof input.signature === "string" && input.signature.trim().length >= 12, "SIGNATURE_REQUIRED", "Monthly payroll requires a deliberate signature payload");
    item.signatureHash = sha256(input.signature.trim());
  }
  assertDomain(input.confirmed === true, "CONFIRMATION_REQUIRED", "Explicit confirmation is required");
  item.acknowledgedAt = now;
  store.addAudit({ type: "payroll.acknowledged", payrollId: item.id, employeeId: employee.id, at: now });
  return { id: item.id, acknowledgedAt: now, replayed: false };
}

module.exports = { listPayroll, acknowledgePayroll };
