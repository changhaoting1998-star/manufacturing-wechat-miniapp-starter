const test = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers");

function valid() { return { workDate: "2030-01-15", consent: true, locationLabel: "示例厂区北门" }; }

test("current employee can clock in", () => {
  const { service, actor } = fixture();
  assert.equal(service.clockIn(actor, valid()).source, "self-service");
});

test("clock-in requires binding", () => {
  const { service, stranger } = fixture();
  assert.throws(() => service.clockIn(stranger, valid()), { code: "EMPLOYEE_NOT_BOUND" });
});

test("clock-in refuses delegated employee id", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.clockIn(actor, { ...valid(), employeeId: "employee-demo-002" }), { code: "DELEGATED_CLOCK_FORBIDDEN" });
});

test("clock-in requires location consent", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.clockIn(actor, { ...valid(), consent: false }), { code: "LOCATION_CONSENT_REQUIRED" });
});

test("clock-in validates work date", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.clockIn(actor, { ...valid(), workDate: "tomorrow" }), { code: "WORK_DATE_INVALID" });
});

test("duplicate clock-in is rejected", () => {
  const { service, actor } = fixture();
  service.clockIn(actor, valid());
  assert.throws(() => service.clockIn(actor, valid()), { code: "ALREADY_CLOCKED_IN" });
});

test("clock-out completes existing attendance", () => {
  const { service, actor } = fixture(["2030-01-15T08:00:00.000Z", "2030-01-15T17:00:00.000Z"]);
  service.clockIn(actor, valid());
  assert.equal(service.clockOut(actor, { workDate: "2030-01-15" }).clockOutAt, "2030-01-15T17:00:00.000Z");
});

test("clock-out requires clock-in", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.clockOut(actor, { workDate: "2030-01-15" }), { code: "CLOCK_IN_REQUIRED" });
});

test("second clock-out is rejected", () => {
  const { service, actor } = fixture(["2030-01-15T08:00:00.000Z", "2030-01-15T17:00:00.000Z", "2030-01-15T18:00:00.000Z"]);
  service.clockIn(actor, valid());
  service.clockOut(actor, { workDate: "2030-01-15" });
  assert.throws(() => service.clockOut(actor, { workDate: "2030-01-15" }), { code: "ALREADY_CLOCKED_OUT" });
});
