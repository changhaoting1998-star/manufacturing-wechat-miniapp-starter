function syntheticSeed() {
  return {
    employees: [
      { id: "employee-demo-001", code: "DEMO-001", displayName: "林晓", department: "装配一组", active: true, subjectId: "subject-demo-001" },
      { id: "employee-demo-002", code: "DEMO-002", displayName: "周宁", department: "质量组", active: true, subjectId: null },
    ],
    payroll: [
      { id: "payroll-day-demo", employeeId: "employee-demo-001", periodType: "day", periodKey: "2030-01-14", amount: "168.50", currency: "CNY", published: true },
      { id: "payroll-month-demo", employeeId: "employee-demo-001", periodType: "month", periodKey: "2030-01", amount: "4680.00", currency: "CNY", published: true },
    ],
    formTemplates: [
      {
        id: "form-safety-demo",
        title: "班前安全确认",
        active: true,
        fields: [
          { key: "equipment", label: "设备状态", type: "select", required: true },
          { key: "note", label: "补充说明", type: "text", required: false },
        ],
      },
    ],
  };
}

module.exports = { syntheticSeed };
