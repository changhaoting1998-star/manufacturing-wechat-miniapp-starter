const test = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers");

test("access request is pending and audited", () => {
  const { service, store, unbound } = fixture();
  const item = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  assert.equal(item.status, "pending");
  assert.equal(store.auditLog()[0].type, "access.requested");
});

test("duplicate pending access request is replayed", () => {
  const { service, unbound } = fixture();
  const first = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  const second = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  assert.equal(first.id, second.id);
  assert.equal(second.replayed, true);
});

test("access request requires verified identity", () => {
  const { service } = fixture();
  assert.throws(() => service.requestAccess({}, { employeeCode: "DEMO-002", displayName: "周宁" }), { code: "ACTOR_REQUIRED" });
});

test("access request validates employee code", () => {
  const { service, unbound } = fixture();
  assert.throws(() => service.requestAccess(unbound, { employeeCode: "?", displayName: "周宁" }), { code: "EMPLOYEE_CODE_INVALID" });
});

test("access review requires permission", () => {
  const { service, unbound } = fixture();
  const item = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  assert.throws(() => service.reviewAccess({ actorId: "viewer", permissions: [] }, item.id, "approved"), { code: "FORBIDDEN" });
});

test("approved request binds matching employee", () => {
  const { service, store, unbound, admin } = fixture();
  const item = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  service.reviewAccess(admin, item.id, "approved");
  assert.equal(store.employee("employee-demo-002").subjectId, unbound.subjectId);
});

test("rejection requires a useful note", () => {
  const { service, unbound, admin } = fixture();
  const item = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  assert.throws(() => service.reviewAccess(admin, item.id, "rejected", "x"), { code: "REJECT_NOTE_REQUIRED" });
});

test("review cannot be repeated", () => {
  const { service, unbound, admin } = fixture();
  const item = service.requestAccess(unbound, { employeeCode: "DEMO-002", displayName: "周宁" });
  service.reviewAccess(admin, item.id, "rejected", "编号需要核对");
  assert.throws(() => service.reviewAccess(admin, item.id, "approved"), { code: "REQUEST_ALREADY_REVIEWED" });
});
