const test = require("node:test");
const assert = require("node:assert/strict");
const { fixture } = require("./helpers");

test("draft is saved for current employee", () => {
  const { service, actor } = fixture();
  const draft = service.saveDraft(actor, "form-safety-demo", { equipment: "正常", note: "" });
  assert.equal(draft.employeeId, "employee-demo-001");
});

test("draft requires active template", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.saveDraft(actor, "missing", {}), { code: "FORM_TEMPLATE_NOT_FOUND" });
});

test("required form field is enforced", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.submitForm(actor, "form-safety-demo", { note: "缺少状态" }), { code: "FORM_FIELD_REQUIRED" });
});

test("unknown form field is rejected", () => {
  const { service, actor } = fixture();
  assert.throws(() => service.submitForm(actor, "form-safety-demo", { equipment: "正常", hidden: "value" }), { code: "FORM_FIELD_UNKNOWN" });
});

test("submission clears matching draft", () => {
  const { service, store, actor } = fixture();
  service.saveDraft(actor, "form-safety-demo", { equipment: "正常", note: "草稿" });
  const item = service.submitForm(actor, "form-safety-demo", { equipment: "正常", note: "完成" });
  assert.equal(item.id, "submission-0001");
  assert.equal(store.formDrafts.size, 0);
});

test("form submission is audited without body", () => {
  const { service, store, actor } = fixture();
  service.submitForm(actor, "form-safety-demo", { equipment: "正常", note: "合成说明" });
  const event = store.auditLog().at(-1);
  assert.equal(event.type, "form.submitted");
  assert.equal(JSON.stringify(event).includes("合成说明"), false);
});
