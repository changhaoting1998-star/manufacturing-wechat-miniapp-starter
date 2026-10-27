const test = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers");
const { MemoryMesTransport, MesConnector } = require("../src");
const { createGateway } = require("../cloudfunctions/employeeGateway/handler");

function gatewayFor(subjectId = "subject-demo-001") {
  const { service, store } = fixture();
  return createGateway({ service, connector: new MesConnector(store, new MemoryMesTransport()), identify: async () => ({ subjectId }) });
}

test("gateway returns safe success envelope", async () => {
  const result = await gatewayFor()({ action: "payroll.list" });
  assert.equal(result.ok, true);
  assert.equal(result.data.length, 2);
});

test("gateway maps domain failure without stack", async () => {
  const result = await gatewayFor("subject-unknown")({ action: "payroll.list" });
  assert.deepEqual(Object.keys(result).sort(), ["code", "message", "ok"]);
  assert.equal(result.code, "EMPLOYEE_NOT_BOUND");
});

test("gateway rejects unknown action", async () => {
  const result = await gatewayFor()({ action: "dangerous.delete-all" });
  assert.equal(result.code, "ACTION_UNKNOWN");
});

test("gateway identity comes from verified context", async () => {
  const result = await gatewayFor("subject-demo-001")({ action: "attendance.clock-in", payload: { subjectId: "subject-demo-999", workDate: "2030-01-15", consent: true } });
  assert.equal(result.ok, true);
  assert.equal(result.data.employeeId, "employee-demo-001");
});

test("gateway hides unexpected internal error", async () => {
  const handler = createGateway({ service: { listPayroll: () => { throw new Error("database detail"); } }, connector: {}, identify: async () => ({ subjectId: "x" }) });
  const result = await handler({ action: "payroll.list" });
  assert.equal(result.message, "Request could not be completed");
  assert.equal(JSON.stringify(result).includes("database detail"), false);
});
