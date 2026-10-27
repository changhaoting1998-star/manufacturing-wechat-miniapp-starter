const { assertDomain } = require("./errors");

function employeeForActor(store, actor) {
  assertDomain(actor && actor.subjectId, "ACTOR_REQUIRED", "Verified platform identity is required");
  const employee = [...store.employees.values()].find((item) => item.subjectId === actor.subjectId && item.active);
  assertDomain(employee, "EMPLOYEE_NOT_BOUND", "The current identity is not bound to an active employee");
  return employee;
}

function attendanceKey(employeeId, workDate) {
  return `${employeeId}:${workDate}`;
}

function clockIn(store, actor, input, now) {
  const employee = employeeForActor(store, actor);
  assertDomain(!input.employeeId || input.employeeId === employee.id, "DELEGATED_CLOCK_FORBIDDEN", "Clock-in is limited to the current employee");
  assertDomain(/^\d{4}-\d{2}-\d{2}$/.test(input.workDate || ""), "WORK_DATE_INVALID", "Work date must use YYYY-MM-DD");
  assertDomain(input.consent === true, "LOCATION_CONSENT_REQUIRED", "Location capture requires an explicit user action");
  const key = attendanceKey(employee.id, input.workDate);
  assertDomain(!store.attendance.has(key), "ALREADY_CLOCKED_IN", "The current employee already clocked in for this work date");
  const record = {
    id: `attendance-${input.workDate}-${employee.id}`,
    employeeId: employee.id,
    workDate: input.workDate,
    clockInAt: now,
    clockOutAt: null,
    locationLabel: input.locationLabel || null,
    source: "self-service",
  };
  store.attendance.set(key, record);
  store.addAudit({ type: "attendance.clock-in", attendanceId: record.id, at: now });
  return { ...record };
}

function clockOut(store, actor, input, now) {
  const employee = employeeForActor(store, actor);
  assertDomain(!input.employeeId || input.employeeId === employee.id, "DELEGATED_CLOCK_FORBIDDEN", "Clock-out is limited to the current employee");
  const key = attendanceKey(employee.id, input.workDate);
  const record = store.attendance.get(key);
  assertDomain(record, "CLOCK_IN_REQUIRED", "Clock-in must exist before clock-out");
  assertDomain(!record.clockOutAt, "ALREADY_CLOCKED_OUT", "Attendance is already complete");
  assertDomain(Date.parse(now) > Date.parse(record.clockInAt), "CLOCK_OUT_TIME_INVALID", "Clock-out must be after clock-in");
  record.clockOutAt = now;
  store.addAudit({ type: "attendance.clock-out", attendanceId: record.id, at: now });
  return { ...record };
}

module.exports = { employeeForActor, attendanceKey, clockIn, clockOut };
