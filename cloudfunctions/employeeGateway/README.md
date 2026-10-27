# Gateway wiring

`handler.js` is platform-neutral and tested without network access. `index.example.js` documents the production boundary.

Production wiring must:

1. read the verified Mini Program identity from the CloudBase execution context;
2. use a persistent repository with authorization enforced on every operation;
3. keep employee, payroll, signature, attendance and location data server-side;
4. store secrets in platform environment settings;
5. log action, actor, target, outcome and receipt without logging sensitive bodies;
6. configure database collections so clients cannot read or write them directly.

The starter intentionally does not ship a deployable production `index.js` because authentication and storage rules depend on the operator's CloudBase account and data policy.
