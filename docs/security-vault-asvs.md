# Security, Vault, and OWASP ASVS

## Secrets Policy

- No broker credentials in source code.
- No account IDs, certificates, API keys, Vault tokens, Vercel tokens, or private customer data in source code.
- `.env` must remain local and uncommitted.
- `.env.example` contains safe fake defaults only.

## Vault Transit Future Design

Future Broker Gateway services can use Vault Transit for encryption, decryption, signing, and verification. Strategy Runner must never see plaintext broker keys.

Current policy files are placeholders only and must not be applied without security review.

## No Plaintext Broker Keys

Broker credentials should be injected only into the Broker Gateway runtime boundary after approval. They should not be visible to Strategy Engine, frontend, Codex prompts, logs, tests, or documentation examples.

## OWASP ASVS Alignment Checklist Placeholder

- Authentication and session management.
- Access control and RBAC/ABAC.
- Input validation.
- API security.
- Cryptographic controls.
- Logging and audit controls.
- Secrets management.
- Secure deployment configuration.

## RBAC/ABAC Placeholder

Future roles should distinguish researcher, operator, reviewer, administrator, auditor, and service accounts. Attributes should include environment, strategy, account boundary, and risk approval scope.

## Audit Log Immutability Placeholder

High-risk actions should write immutable audit events. Future enterprise deployments can use WORM storage or append-only event stores.

## Secure Deployment Notes

- Separate research, backtest, paper, shadow, and live environments.
- Separate credentials and database instances by environment.
- Use network policies between Control Plane and Trading/Data Plane.
- Do not deploy placeholder files to production without review.

## Acceptance Criteria

- No secrets are committed.
- Vault policy is placeholder-only.
- Broker keys are never visible to strategies.
- ASVS alignment is tracked as a future checklist.
