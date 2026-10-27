# Manufacturing WeChat Mini Program Starter

[![CI](https://github.com/changhaoting1998-star/manufacturing-wechat-miniapp-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/changhaoting1998-star/manufacturing-wechat-miniapp-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A privacy-first, synthetic starter that turns a familiar WeChat Mini Program into a low-friction shop-floor data channel for small and medium-sized manufacturers.

## Why this matters

Many frontline events are still reported on paper, in chat messages or after a shift. The delay makes production, quality and workforce records incomplete when managers need them. A Mini Program can collect structured data at the point of work without asking employees to install or learn another application, then return validated events to MES, payroll or factory administration systems.

The intended production model always works with an MES. MES remains the system of record for work orders, processes, routing, equipment, production results and quality records. The Mini Program is the employee-facing collection and feedback layer: it receives authorized tasks from MES and sends verified shop-floor events back through an auditable adapter.

This starter focuses on four practical outcomes:

- capture production completion, material use, quality, abnormal events, work time and forms as close to the event as possible;
- maintain an approved employee roster and auditable employment records;
- deliver payroll statements to the correct employee and record acknowledgement safely;
- compare each employee's demonstrated efficiency across processes to support training, shift planning and job assignment.

```text
MES work order / process master data
                 ↓
Frontline employee ↔ familiar Mini Program → validated shop-floor event → MES
                              │
                              └→ approved payroll / administration boundary
                                                     ↓
                                   process evidence and feedback loop
```

Process-efficiency analytics should support a manager's decision, not make an employment decision by itself. A production implementation should use comparable measurements, show the evidence and time window, allow correction or appeal, exclude protected or irrelevant personal attributes, and require human review before changes to assignment, pay or employment status.

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

## MES integration model

This repository provides the boundary pattern; an operator supplies the adapter for its own MES.

| Direction | Typical records | Owner |
| --- | --- | --- |
| MES → Mini Program | released work orders, operation definitions, allowed equipment, shift tasks and quality checkpoints | MES |
| Mini Program → MES | start/finish events, quantity, scrap reason, process time, inspection result, abnormal event and attachment reference | MES after validation |
| HR/payroll → Mini Program | approved employee binding and published payroll notice | HR/payroll system |
| Mini Program → HR/payroll | acknowledgement, correction request and signature hash | HR/payroll system after validation |

Every outbound MES event should include a stable idempotency key, source employee binding, work-order and operation references, device or station context, event time, payload hash and receipt. The adapter must reject unknown work orders, unauthorized operations, stale master-data versions and receipt hash mismatches. Failed or uncertain writes remain pending for safe retry instead of being counted twice.

Efficiency comparisons should be calculated from MES-confirmed production events with comparable product, operation, equipment, shift and quality conditions. The result can suggest training or assignment options, but a manager should review the evidence and quality outcome before changing a person's job.

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

本项目面向中小制造业企业，将员工已经熟悉的微信小程序变成低门槛的一线数据入口。它需要配合 MES 使用，不替代 MES：MES 负责工单、工艺路线、设备、生产结果和质量记录等主数据与最终账本；小程序接收 MES 已授权的任务，并把员工在现场提交的报工、数量、工时、质量、异常和表单数据校验后回传 MES。

项目还可以维护经过审核的员工档案，向本人发送工资单并记录确认结果；基于 MES 已确认的生产事件，在产品、工艺、设备、班次和质量条件可比时分析不同工艺效率，辅助培训、排班和岗位匹配。效率数据只应作为管理者的决策支持，不能单独决定调岗、薪资或去留。正式系统应提供人工复核、记录纠正与申诉机制，并排除与工作无关或受保护的个人属性。

示例数据全部为虚构数据。项目重点演示员工准入、本人考勤、工资确认、动态表单和 MES 回执的安全边界，不包含任何真实企业的小程序标识、云环境、员工、工资、考勤、签名或部署资料。

项目不是可直接上线的完整 MES。正式使用前必须接入企业自己的身份、权限、数据库、审计、加密、备份、数据保留和隐私告知制度。

## License

MIT. See [LICENSE](LICENSE).
