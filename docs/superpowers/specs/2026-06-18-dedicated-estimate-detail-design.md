# Dedicated Estimate Detail Design

## Goal

Move Price Estimation detail from the right side panel into a dedicated page/view.

## Design

Price Estimation becomes a three-mode workspace owned by `PriceEstimationContainer`:

- `list`: table of estimates with filters and actions
- `form`: create/edit estimate form
- `detail`: full-page estimate detail view

## List View

`PriceEstimationListView` becomes full width. It no longer owns selected estimate state and no longer renders detail sidebar.

Rows keep actions:

- View opens dedicated detail page
- Edit opens form
- Duplicate opens form as new draft
- Delete shows confirmation

## Detail View

Create `PriceEstimationDetailView`.

It shows:

- Back button
- Edit, Duplicate, Delete buttons
- estimate header: No Job, SKU, Client, Project, Status, Total, Turnaround
- line-item detail cards with layer, item name, inputs, notes, and line total
- delete confirmation for selected estimate

## Data Flow

- `PriceEstimationContainer` stores `selectedEstimate`
- List `onViewEstimate(estimate)` sets selected estimate and mode `detail`
- Detail actions call existing container handlers: edit, duplicate, delete
- Delete returns to list after success

## Tests

- List view calls `onViewEstimate` when View clicked.
- Detail view renders header and line details.
- Detail view Edit/Duplicate/Delete buttons call handlers.
- Container can render list/detail through existing state transitions.
