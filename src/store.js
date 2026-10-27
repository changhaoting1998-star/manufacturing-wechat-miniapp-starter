const { assertDomain } = require("./errors");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class MemoryStore {
  constructor(seed = {}) {
    this.employees = new Map((seed.employees || []).map((item) => [item.id, clone(item)]));
    this.accessRequests = new Map();
    this.attendance = new Map();
    this.payroll = new Map((seed.payroll || []).map((item) => [item.id, clone(item)]));
    this.formTemplates = new Map((seed.formTemplates || []).map((item) => [item.id, clone(item)]));
    this.formDrafts = new Map();
    this.formSubmissions = new Map();
    this.receipts = new Map();
    this.audit = [];
  }

  employee(id) {
    const value = this.employees.get(id);
    return value ? clone(value) : null;
  }

  putEmployee(value) {
    assertDomain(value && value.id, "EMPLOYEE_ID_REQUIRED", "Employee id is required");
    this.employees.set(value.id, clone(value));
    return this.employee(value.id);
  }

  addAudit(event) {
    this.audit.push(clone(event));
  }

  auditLog() {
    return clone(this.audit);
  }
}

module.exports = { MemoryStore, clone };
