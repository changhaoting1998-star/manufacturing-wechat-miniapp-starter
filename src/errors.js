class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

function assertDomain(condition, code, message) {
  if (!condition) throw new DomainError(code, message);
}

module.exports = { DomainError, assertDomain };
