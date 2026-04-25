# Vault Placeholder

Future production-like environments must use a secrets manager such as Vault or a cloud-managed equivalent.

Current rules:
- Do not store secrets in this repository.
- Do not commit broker credentials, account IDs, certificates, API keys, or tokens.
- Keep `.env.example` safe and fake.
- Keep `.env` ignored.

Future work:
- Define secret paths.
- Define service identity.
- Define rotation policy.
- Define local development fallback with fake paper-only values.
