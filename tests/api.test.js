const test = require("node:test");
const assert = require("node:assert/strict");
const { createApi } = require("../miniprogram/services/api");

test("Mini Program API sends action envelope", async () => {
  const calls = [];
  const api = createApi({ functionName: "employeeGateway", callFunction: async (request) => { calls.push(request); return { result: { ok: true, data: { id: "request-demo" } } }; } });
  await api.requestAccess({ employeeCode: "DEMO-002" });
  assert.equal(calls[0].name, "employeeGateway");
  assert.equal(calls[0].data.action, "access.request");
});

test("Mini Program API propagates safe error code", async () => {
  const api = createApi({ functionName: "employeeGateway", callFunction: async () => ({ result: { ok: false, code: "FORBIDDEN", message: "No access" } }) });
  await assert.rejects(() => api.payroll(), { code: "FORBIDDEN" });
});

test("Mini Program API handles malformed response", async () => {
  const api = createApi({ functionName: "employeeGateway", callFunction: async () => ({}) });
  await assert.rejects(() => api.bootstrap(), { code: "REQUEST_FAILED" });
});
