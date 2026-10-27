const { assertDomain } = require("./errors");
const { sha256 } = require("./crypto");

class MesConnector {
  constructor(store, transport) {
    this.store = store;
    this.transport = transport;
  }

  async exportRecord(input) {
    assertDomain(input && input.kind && input.recordId && input.payload, "EXPORT_INPUT_INVALID", "Export kind, recordId and payload are required");
    assertDomain(input.idempotencyKey && /^[a-z0-9-]{8,80}$/i.test(input.idempotencyKey), "IDEMPOTENCY_KEY_INVALID", "A stable idempotency key is required");
    const payloadHash = sha256(input.payload);
    const prior = this.store.receipts.get(input.idempotencyKey);
    if (prior) {
      assertDomain(prior.payloadHash === payloadHash, "IDEMPOTENCY_CONFLICT", "Idempotency key was already used for a different payload");
      return { ...prior, replayed: true };
    }
    const response = await this.transport.send({
      kind: input.kind,
      recordId: input.recordId,
      payload: input.payload,
      payloadHash,
      idempotencyKey: input.idempotencyKey,
    });
    assertDomain(response && response.accepted === true && response.receiptId, "MES_RECEIPT_INVALID", "MES must return an accepted receipt");
    assertDomain(!response.payloadHash || response.payloadHash === payloadHash, "MES_RECEIPT_HASH_MISMATCH", "MES receipt does not match the exported payload");
    const receipt = {
      idempotencyKey: input.idempotencyKey,
      payloadHash,
      receiptId: response.receiptId,
      acceptedAt: response.acceptedAt,
    };
    this.store.receipts.set(input.idempotencyKey, receipt);
    this.store.addAudit({ type: "mes.exported", kind: input.kind, recordId: input.recordId, receiptId: response.receiptId, at: response.acceptedAt });
    return { ...receipt, replayed: false };
  }
}

class MemoryMesTransport {
  constructor() {
    this.calls = [];
  }

  async send(request) {
    this.calls.push(JSON.parse(JSON.stringify(request)));
    return {
      accepted: true,
      receiptId: `receipt-${String(this.calls.length).padStart(4, "0")}`,
      acceptedAt: "2030-01-15T09:30:00.000Z",
      payloadHash: request.payloadHash,
    };
  }
}

module.exports = { MesConnector, MemoryMesTransport };
