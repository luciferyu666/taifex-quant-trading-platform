# Phase 2: Data Platform

## Objective

Define a safe data foundation for TX/MTX/TMF contract metadata, market bars, rollover events, and data quality reports.

## Deliverables

- Contract master schema.
- Market bars schema.
- Rollover events schema.
- Data quality reports schema.
- Bronze/Silver/Gold data layer plan.

## Acceptance Criteria

- Contract specs include TX, MTX, and TMF point values.
- Research adjusted series are separate from real contract prices.
- Rollover data records adjustment method and data version.
- No external market data is downloaded by default.

## Safety Constraints

- Do not connect to broker APIs.
- Do not imply adjusted continuous contracts are tradable.
- Do not use external credentials.

## Suggested Commands

```bash
test -f data-pipeline/schemas/contract_master.sql
test -f data-pipeline/schemas/rollover_events.sql
cd backend && pytest tests/test_contracts.py
make check
```

## Next Implementation Notes

Next safe slice: implement local CSV validation fixtures and data quality checks without downloading external data.
