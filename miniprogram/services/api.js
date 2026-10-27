function createApi({ callFunction, functionName }) {
  async function invoke(action, payload = {}) {
    const response = await callFunction({ name: functionName, data: { action, payload } });
    const result = response && response.result;
    if (!result || result.ok !== true) {
      const error = new Error((result && result.message) || "Request failed");
      error.code = (result && result.code) || "REQUEST_FAILED";
      throw error;
    }
    return result.data;
  }
  return {
    bootstrap: () => invoke("bootstrap"),
    requestAccess: (payload) => invoke("access.request", payload),
    clockIn: (payload) => invoke("attendance.clock-in", payload),
    clockOut: (payload) => invoke("attendance.clock-out", payload),
    payroll: () => invoke("payroll.list"),
    acknowledgePayroll: (payload) => invoke("payroll.acknowledge", payload),
    forms: () => invoke("forms.list"),
    submitForm: (payload) => invoke("forms.submit", payload),
  };
}

module.exports = { createApi };
