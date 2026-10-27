const { MemoryStore, EmployeeService, syntheticSeed } = require("../src");

function fixture(times = ["2030-01-15T08:00:00.000Z"]) {
  const store = new MemoryStore(syntheticSeed());
  let index = 0;
  const service = new EmployeeService(store, () => times[Math.min(index++, times.length - 1)]);
  return {
    store,
    service,
    actor: { subjectId: "subject-demo-001" },
    unbound: { subjectId: "subject-demo-002" },
    stranger: { subjectId: "subject-demo-999" },
    admin: { actorId: "admin-demo-001", permissions: ["access.review"] },
  };
}

module.exports = { fixture };
