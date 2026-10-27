const test = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers");

test("employee sees only own published payroll", () => {
  const { service, store, actor } = fixture();
  store.payroll.set("other", { id: "other", employeeId: "employee-demo-002", periodType: "day", published: true, amount: "99.00", currency: "CNY" });
  assert.deepEqual(service.listPayroll(actor).map((item) => item.id), ["payroll-day-demo", "payroll-month-demo"]);
});

test("unbound identity cannot list payroll", () => {
  const { service, stranger } = fixture();
  assert.throws(() => service.listPayroll(stranger), { code: "EMPLOYEE_NOT_BOUND" });
});

test("daily payroll accepts explicit confirmation", () => {
  const { service, actor } = fixture();
  const result = service.acknowledgePayroll(actor, "payroll-day-demo", { confirmed: true });
  assert.equal(result.replayed, false);
});

test("payroll confirmation is idempotent", () => {
  const { service, actor } = fixture();
  service.acknowledgePayroll(actor, "payroll-day-demo", { confirmed: true });
  assert.equal(service.acknowledgePayroll(actor, "payroll-day-demo", { confirmed: true }).replayed, true);
});

test("monthly payroll requires signature", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.acknowledgePayroll(actor, "payroll-month-demo", { confirmed: true, signature: "short" }), { code: "SIGNATURE_REQUIRED" });
});

test("monthly payroll stores hash instead of signature body", () => {
  const { service, store, actor } = fixture();
  const signature = "synthetic-signature-strokes";
  service.acknowledgePayroll(actor, "payroll-month-demo", { confirmed: true, signature });
  const row = store.payroll.get("payroll-month-demo");
  assert.equal(row.signatureHash.length, 64);
  assert.equal(JSON.stringify(row).includes(signature), false);
});

test("payroll requires explicit confirmation", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.acknowledgePayroll(actor, "payroll-day-demo", { confirmed: false }), { code: "CONFIRMATION_REQUIRED" });
});

test("employee cannot acknowledge another employee payroll", () => {
  const { service, store, actor } = fixture();
  store.payroll.set("other", { id: "other", employeeId: "employee-demo-002", periodType: "day", published: true });
  assert.throws(() => service.acknowledgePayroll(actor, "other", { confirmed: true }), { code: "FORBIDDEN" });
});
