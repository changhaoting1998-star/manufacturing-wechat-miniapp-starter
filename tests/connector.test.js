const test = require("node:test");
const assert = require("node:assert/strict");
const { MemoryStore, MesConnector, MemoryMesTransport } = require("../src");

function input(payload = { hours: 8 }) {
  return { kind: "attendance", recordId: "attendance-demo-001", payload, idempotencyKey: "attendance-demo-001-v1" };
}

test("MES export returns verifiable receipt", async () => {
  const connector = new MesConnector(new MemoryStore(), new MemoryMesTransport());
  const receipt = await connector.exportRecord(input());
  assert.equal(receipt.payloadHash.length, 64);
  assert.equal(receipt.receiptId, "receipt-0001");
});

test("same idempotency key and payload is replayed locally", async () => {
  const transport = new MemoryMesTransport();
  const connector = new MesConnector(new MemoryStore(), transport);
  await connector.exportRecord(input());
  assert.equal((await connector.exportRecord(input())).replayed, true);
  assert.equal(transport.calls.length, 1);
});

test("same idempotency key with changed payload is rejected", async () => {
  const connector = new MesConnector(new MemoryStore(), new MemoryMesTransport());
  await connector.exportRecord(input());
  await assert.rejects(() => connector.exportRecord(input({ hours: 9 })), { code: "IDEMPOTENCY_CONFLICT" });
});

test("invalid idempotency key is rejected", async () => {
  const connector = new MesConnector(new MemoryStore(), new MemoryMesTransport());
  await assert.rejects(() => connector.exportRecord({ ...input(), idempotencyKey: "x" }), { code: "IDEMPOTENCY_KEY_INVALID" });
});

test("MES must acknowledge request", async () => {
  const connector = new MesConnector(new MemoryStore(), { send: async () => ({ accepted: false }) });
  await assert.rejects(() => connector.exportRecord(input()), { code: "MES_RECEIPT_INVALID" });
});

test("MES receipt hash mismatch is rejected", async () => {
  const connector = new MesConnector(new MemoryStore(), { send: async () => ({ accepted: true, receiptId: "r1", payloadHash: "wrong" }) });
  await assert.rejects(() => connector.exportRecord(input()), { code: "MES_RECEIPT_HASH_MISMATCH" });
});

test("audit receipt excludes exported payload", async () => {
  const store = new MemoryStore();
  const connector = new MesConnector(store, new MemoryMesTransport());
  await connector.exportRecord(input({ syntheticNote: "body-marker" }));
  assert.equal(JSON.stringify(store.auditLog()).includes("body-marker"), false);
});
