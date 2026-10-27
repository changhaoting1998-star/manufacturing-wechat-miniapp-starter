const { assertDomain } = require("./errors");
const { employeeForActor } = require("./attendance");

function template(store, templateId) {
  const item = store.formTemplates.get(templateId);
  assertDomain(item && item.active, "FORM_TEMPLATE_NOT_FOUND", "Active form template does not exist");
  return item;
}

function validateValues(item, values) {
  const allowed = new Set(item.fields.map((field) => field.key));
  for (const key of Object.keys(values || {})) assertDomain(allowed.has(key), "FORM_FIELD_UNKNOWN", `Unknown form field: ${key}`);
  for (const field of item.fields) {
    if (field.required) assertDomain(values && values[field.key] !== undefined && values[field.key] !== "", "FORM_FIELD_REQUIRED", `${field.key} is required`);
  }
}

function saveDraft(store, actor, templateId, values, now) {
  const employee = employeeForActor(store, actor);
  const item = template(store, templateId);
  validateValues(item, values);
  const key = `${employee.id}:${templateId}`;
  const draft = { employeeId: employee.id, templateId, values: { ...values }, savedAt: now };
  store.formDrafts.set(key, draft);
  return { ...draft };
}

function submitForm(store, actor, templateId, values, now) {
  const employee = employeeForActor(store, actor);
  const item = template(store, templateId);
  validateValues(item, values);
  const id = `submission-${String(store.formSubmissions.size + 1).padStart(4, "0")}`;
  const submission = { id, employeeId: employee.id, templateId, values: { ...values }, submittedAt: now };
  store.formSubmissions.set(id, submission);
  store.formDrafts.delete(`${employee.id}:${templateId}`);
  store.addAudit({ type: "form.submitted", submissionId: id, templateId, at: now });
  return { ...submission };
}

module.exports = { validateValues, saveDraft, submitForm };
