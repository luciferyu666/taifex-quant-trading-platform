# Strategy Engine

Purpose: host future strategy runners that emit target exposure signals only.

Rules:

- Do not call broker SDKs from strategy code.
- Do not create orders directly.
- Emit structured signals for Risk Engine and OMS processing.
- Keep paper-trading and shadow-trading workflows separate from live trading.

## Strategy SDK Scaffold

The `sdk/` directory contains a minimal signal-only interface:

- `sdk/signal.py`: strategy signal dataclass.
- `sdk/base_strategy.py`: base class for signal generation.
- `sdk/examples/simple_signal_strategy.py`: paper-safe example strategy.

The SDK does not expose order submission or broker access. Future strategies should emit target TX-equivalent exposure only, then let Risk Engine and OMS handle any paper execution workflow.
