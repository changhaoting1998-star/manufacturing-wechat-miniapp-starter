const { assertDomain } = require("./errors");

function requestAccess(store, actor, input, now) {
  assertDomain(actor && actor.subjectId, "ACTOR_REQUIRED", "Verified platform identity is required");
  assertDomain(input && /^[A-Z0-9-]{3,24}$/.test(input.employeeCode || ""), "EMPLOYEE_CODE_INVALID", "Use a short organization-issued employee code");
  assertDomain(input.displayName && input.displayName.trim().length >= 2, "DISPLAY_NAME_INVALID", "Display name is required");
  const existing = [...store.accessRequests.values()].find((item) => item.subjectId === actor.subjectId && item.status === "pending");
  if (existing) return { ...existing, replayed: true };
  const id = `request-${String(store.accessRequests.size + 1).padStart(4, "0")}`;
  const item = {
    id,
    subjectId: actor.subjectId,
    employeeCode: input.employeeCode,
    displayName: input.displayName.trim(),
    status: "pending",
    requestedAt: now,
  };
  store.accessRequests.set(id, item);
  store.addAudit({ type: "access.requested", requestId: id, at: now });
  return { ...item, replayed: false };
}

function reviewAccess(store, admin, requestId, decision, note, now) {
  assertDomain(admin && admin.permissions && admin.permissions.includes("access.review"), "FORBIDDEN", "Access review permission is required");
  const item = store.accessRequests.get(requestId);
  assertDomain(item, "REQUEST_NOT_FOUND", "Access request does not exist");
  assertDomain(item.status === "pending", "REQUEST_ALREADY_REVIEWED", "Access request is already final");
  assertDomain(["approved", "rejected"].includes(decision), "DECISION_INVALID", "Decision must be approved or rejected");
  if (decision === "rejected") assertDomain((note || "").trim().length >= 3, "REJECT_NOTE_REQUIRED", "A rejection note is required");
  item.status = decision;
  item.reviewedAt = now;
  item.reviewNote = (note || "").trim();
  if (decision === "approved") {
    const employee = [...store.employees.values()].find((candidate) => candidate.code === item.employeeCode);
    assertDomain(employee, "EMPLOYEE_NOT_FOUND", "Employee code does not match the synthetic roster");
    assertDomain(!employee.subjectId || employee.subjectId === item.subjectId, "EMPLOYEE_ALREADY_BOUND", "Employee is already bound");
    employee.subjectId = item.subjectId;
    employee.active = true;
    store.employees.set(employee.id, employee);
  }
  store.addAudit({ type: `access.${decision}`, requestId, reviewerId: admin.actorId, at: now });
  return { ...item };
}

module.exports = { requestAccess, reviewAccess };
