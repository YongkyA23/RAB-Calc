# Estimation Line Pricing Design

## Goal

Make estimation rows show individual prices, add notes to Additional Costs, and match Excel formulas for Paper Purchase and Metalize Material.

## Requirements

- Always show each row's individual computed price.
- Additional Cost rows include a Notes field.
- Paper Purchase defaults to `5000` and calculates `5000 × quantity`.
- Metalize Material uses `Length (cm) × Width (cm) × Quantity × Rp 5`.
- Metalize Material shows length and width fields instead of generic amount.
- Rush Job, Over Time, In-house Finishing, Buy Product, Fee Operator, and Mockup Operations remain manual amount entries.
- Save notes and special dimensions in quote draft inputs and line item snapshots.

## Data Model

Additional line inputs may include:

- `amount`
- `quantity`
- `notes`
- `lengthCm`
- `widthCm`

Metalize uses `lengthCm`, `widthCm`, `quantity`, and `rate` from price item.

Paper Purchase uses `amount` default `5000`, `quantity`, and `notes`.

## Calculation

Additional totals:

- manual mode: `amount`
- rate mode: `quantity × rate`
- area mode: `lengthCm × widthCm × quantity × rate`

Metalize Material should use area mode with `rate: 5` and `unitLabel: 'cm²'`.

## UI

Each row shows a small price summary:

- Print/Digital: `unit price × quantity = line total`
- Manual: `formula/manual total = line total`
- Manpower: `daily rate × days = line total`
- Paper Purchase: `Rp 5.000 × quantity = line total`
- Metalize: `length × width × quantity × Rp 5 = line total`

Additional Cost row fields:

- normal manual/rate item: Cost type, Amount, Quantity, Notes, Price summary
- Metalize: Cost type, Length (cm), Width (cm), Quantity, Notes, Price summary

## Tests

- Calculation test for area mode.
- Estimation model test for Metalize total.
- Estimation UI test for Metalize length/width fields and Paper Purchase default amount.
