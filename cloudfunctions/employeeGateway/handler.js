const { DomainError } = require("../../src/errors");

function createGateway({ service, connector, identify }) {
  return async function gateway(event, context = {}) {
    try {
      const actor = await identify(context);
      const payload = (event && event.payload) || {};
      let data;
      switch (event && event.action) {
        case "bootstrap":
          data = { bound: Boolean(actor.subjectId), features: ["access", "attendance", "payroll", "forms"] };
          break;
        case "access.request": data = service.requestAccess(actor, payload); break;
        case "attendance.clock-in": data = service.clockIn(actor, payload); break;
        case "attendance.clock-out": data = service.clockOut(actor, payload); break;
        case "payroll.list": data = service.listPayroll(actor); break;
        case "payroll.acknowledge": data = service.acknowledgePayroll(actor, payload.payrollId, payload); break;
        case "forms.submit": data = service.submitForm(actor, payload.templateId, payload.values); break;
        case "mes.export": data = await connector.exportRecord(payload); break;
        default: throw new DomainError("ACTION_UNKNOWN", "Unsupported gateway action");
      }
      return { ok: true, data };
    } catch (error) {
      if (error instanceof DomainError) return { ok: false, code: error.code, message: error.message };
      return { ok: false, code: "INTERNAL_ERROR", message: "Request could not be completed" };
    }
  };
}

module.exports = { createGateway };
