# Estimate Detail Actions Design

## Goal

Make Price Estimation detail useful and expose Edit, Duplicate, and Delete actions for both draft and created estimates.

## Requirements

- Every estimate row shows View, Edit, Duplicate, and Delete actions.
- Detail panel shows Edit, Duplicate, and Delete buttons when an estimate is selected.
- Delete confirmation works for draft and created estimates.
- Delete confirmation copy must not say draft-only.
- Detail panel shows header fields: No Job, SKU, Client, Project, Status, Total, Turnaround.
- Detail panel shows each line item with layer, item name, saved inputs, notes if present, and line total.
- Editing a created estimate reopens the form using its saved `draft` when available, otherwise uses saved line inputs.

## Existing Architecture

`PriceEstimationListView` owns selected estimate and display actions. `PriceEstimationContainer` owns edit, duplicate, and delete handlers. Created estimates already carry `draft` when saved through the current form.

## Tests

- List row renders Edit/Delete for created estimates.
- Detail panel renders header details and line input details.
- Detail panel Edit/Duplicate/Delete buttons call handlers.
- Delete confirmation copy works for created estimates.
