# Strategy Engine

Purpose: host future strategy runners that emit target exposure signals only.

Rules:

- Do not call broker SDKs from strategy code.
- Do not create orders directly.
- Emit structured signals for Risk Engine and OMS processing.
- Keep paper-trading and shadow-trading workflows separate from live trading.
