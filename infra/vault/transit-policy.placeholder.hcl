# Placeholder only.
# Do not apply without security review.
# No real Vault token, broker credential, certificate, or secret is included.

path "transit/encrypt/broker-signing" {
  capabilities = ["update"]
}

path "transit/decrypt/broker-signing" {
  capabilities = ["update"]
}

path "transit/sign/broker-signing" {
  capabilities = ["update"]
}

path "transit/verify/broker-signing" {
  capabilities = ["update"]
}
