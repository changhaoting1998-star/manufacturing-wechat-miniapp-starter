# Manufacturing WeChat Mini Program Starter

[![CI](https://github.com/changhaoting1998-star/manufacturing-wechat-miniapp-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/changhaoting1998-star/manufacturing-wechat-miniapp-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A privacy-first, synthetic starter for manufacturing employee self-service in a native WeChat Mini Program.

It demonstrates the parts that are easy to get wrong when a Mini Program connects to MES or factory administration systems:

- employee access requests with explicit administrative approval;
- platform identity derived from trusted server context;
- current-user-only clock-in and clock-out;
- location collection only after an explicit user action;
- daily payroll acknowledgement and monthly signature requirements;
- dynamic form drafts and submissions;
- idempotent MES exports with payload hashes and receipts;
- audit events that exclude sensitive request bodies;
- fail-closed validation and safe error envelopes.

All names, departments, dates, amounts, identifiers and locations in this repository are synthetic. The repository contains no production AppID, CloudBase environment, endpoint, credential, employee record, attendance location, payroll record or signature.

## Quick start

Node.js 20 or newer is required for the zero-dependency test and demo runtime.

```bash
npm test
npm run demo
```

Expected demo output contains only synthetic identifiers, one MES receipt and a SHA-256 payload hash.

## Repository layout

```text
miniprogram/                 Native WXML/WXSS/JavaScript page skeletons
cloudfunctions/              Platform-neutral gateway and production boundary
src/                         Domain rules, memory store and MES connector
tests/                       Synthetic authorization and failure-path tests
examples/                    Deterministic local demo
```

## Mini Program setup

1. Copy `miniprogram/project.config.example.json` to a local `project.config.json`.
2. Replace the placeholder AppID locally. Do not commit the resulting file.
3. Copy `miniprogram/config.example.js` to your own environment-specific configuration.
4. Connect `cloudfunctions/employeeGateway/handler.js` to a persistent repository and CloudBase identity provider.
5. Configure collections so Mini Program clients cannot read or write employee, payroll, signature, attendance or audit data directly.
6. Compile and preview in WeChat Developer Tools, then verify privacy disclosures before submission.

The included cloud gateway is deliberately not deployable without operator-owned identity and storage wiring. This prevents a demo identity model from being mistaken for production authentication.

## Architecture

```text
Native Mini Program
       │ action + payload
       ▼
Cloud gateway ── verified platform identity
       │
       ├─ employee access and authorization rules
       ├─ attendance / payroll / form services
       └─ MES connector ── idempotency key + payload hash + receipt
```

The client never submits the trusted platform subject identifier. A production adapter must derive it from the verified CloudBase execution context.

## Included workflows

### Employee access

An unbound identity submits an employee code and display name. A server-authorized reviewer approves or rejects the request. Approval binds the verified platform identity to one roster entry. Duplicate pending requests are replayed safely.

### Attendance

Clock-in and clock-out always resolve the employee from the verified identity. Sending another employee ID does not grant delegation. Location requires explicit consent and a user-triggered collection step.

### Payroll acknowledgement

Employees can list only their own published notices. Daily notices require explicit confirmation. Monthly notices also require a deliberate signature payload; the sample stores only its SHA-256 hash.

### Dynamic forms

Templates define allowed and required fields. Unknown fields fail closed. Drafts belong to the current employee and are cleared after a successful submission. Audit entries record the event identity, not form bodies.

### MES export

Every export requires a stable idempotency key. A repeated key with the same payload returns the original receipt without another network call. Reusing the key with a changed payload fails. A receipt with a different payload hash is rejected.

## Privacy and security boundaries

The starter intentionally excludes:

- real Mini Program and CloudBase identifiers;
- deployable keys, tokens and environment files;
- real employee, organization, payroll, attendance, signature and location data;
- direct client access to privileged collections;
- automatic background location collection;
- a production-ready account, RBAC, database or retention implementation.

Before production use, define data minimization, retention, deletion, export, incident response and user notice requirements. Add server-side authorization on every route, encrypted storage, audit retention, rate limits, backups and monitoring.

## Optional Feishu boundary

A Web administration console may use Feishu SSO, but Mini Program identity and Feishu identity should remain separate unless the operator has an approved mapping process. Keep Feishu secrets on the server, restrict allowed tenants and users, and never treat an OAuth login as permission to perform payroll, attendance or employee lifecycle actions.

## Test coverage

The suite verifies access approval, binding conflicts, self-only attendance, explicit location consent, payroll ownership, signature hashing, form schemas, idempotent MES receipts, safe gateway errors, Mini Program structure, placeholder configuration, ignored secrets and absence of production identifier patterns.

```bash
node --test tests/*.test.js
```

## 中文说明

本项目是制造业员工微信小程序的通用起步模板，示例数据全部为虚构数据。它重点演示员工准入、本人考勤、工资确认、动态表单和 MES 回执的安全边界，不包含任何真实企业的小程序标识、云环境、员工、工资、考勤、签名或部署资料。

项目不是可直接上线的完整 MES。正式使用前必须接入企业自己的身份、权限、数据库、审计、加密、备份、数据保留和隐私告知制度。

## License

MIT. See [LICENSE](LICENSE).
