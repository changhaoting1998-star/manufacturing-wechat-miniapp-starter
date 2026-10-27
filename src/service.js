const access = require("./access");
const attendance = require("./attendance");
const payroll = require("./payroll");
const forms = require("./forms");

class EmployeeService {
  constructor(store, clock = () => new Date().toISOString()) {
    this.store = store;
    this.clock = clock;
  }

  requestAccess(actor, input) { return access.requestAccess(this.store, actor, input, this.clock()); }
  reviewAccess(admin, requestId, decision, note = "") { return access.reviewAccess(this.store, admin, requestId, decision, note, this.clock()); }
  clockIn(actor, input) { return attendance.clockIn(this.store, actor, input, this.clock()); }
  clockOut(actor, input) { return attendance.clockOut(this.store, actor, input, this.clock()); }
  listPayroll(actor) { return payroll.listPayroll(this.store, actor); }
  acknowledgePayroll(actor, payrollId, input) { return payroll.acknowledgePayroll(this.store, actor, payrollId, input, this.clock()); }
  saveDraft(actor, templateId, values) { return forms.saveDraft(this.store, actor, templateId, values, this.clock()); }
  submitForm(actor, templateId, values) { return forms.submitForm(this.store, actor, templateId, values, this.clock()); }
}

module.exports = { EmployeeService };
