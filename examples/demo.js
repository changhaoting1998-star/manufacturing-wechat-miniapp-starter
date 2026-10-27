const { MemoryStore, EmployeeService, MesConnector, MemoryMesTransport, syntheticSeed } = require("../src");

async function main() {
  const times = ["2030-01-15T08:00:00.000Z", "2030-01-15T17:00:00.000Z", "2030-01-15T17:05:00.000Z"];
  const store = new MemoryStore(syntheticSeed());
  const service = new EmployeeService(store, () => times.shift() || "2030-01-15T17:05:00.000Z");
  const actor = { subjectId: "subject-demo-001" };
  const attendance = service.clockIn(actor, { workDate: "2030-01-15", consent: true, locationLabel: "示例厂区北门" });
  service.clockOut(actor, { workDate: "2030-01-15" });
  const connector = new MesConnector(store, new MemoryMesTransport());
  const receipt = await connector.exportRecord({
    kind: "attendance",
    recordId: attendance.id,
    payload: { workDate: attendance.workDate, status: "complete" },
    idempotencyKey: `${attendance.id}-v1`,
  });
  console.log(JSON.stringify({ employee: "employee-demo-001", attendance: attendance.id, receipt: receipt.receiptId, payloadHash: receipt.payloadHash }, null, 2));
}

main().catch((error) => { console.error(error.code || error.message); process.exitCode = 1; });
