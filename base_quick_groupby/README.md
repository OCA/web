# base_quick_groupby — List View Column Group By Header Button

**Module**: `base_quick_groupby`  
**Odoo**: 17.0 (tested)  
**License**: AGPL-3  
**Author / Maintainer**: MD Jafor Sadek Khan <rksadeck@gmail.com>  
**Repository**: https://github.com/MD-Jafor-Sadek-Khan/web/tree/17.0-quick-group-by

## Summary

Adds a compact, toggleable group-by button to groupable columns in list/tree views.  
Clicking the button reloads the list grouped by that column. Clicking again clears the grouping.

The button only appears for fields that are safe to group by:

- Excludes `one2many` and `many2many` fields.
- Excludes non-stored computed fields when field metadata indicates `store = False`.

## Features

- Per-column group toggle button rendered in list view header.
- Prevents grouping on relational and non-stored fields.
- Visual feedback: icon toggle, color change, and a brief scale animation.
- Lightweight — implemented via a small QWeb template + JS patch to `ListRenderer`.

## Compatibility

- Targeted for Odoo 17.0.
- Uses `web.assets_backend` to inject templates and JS.
- Depends only on the `web` addon.

## Installation

1. Place the `base_quick_groupby` module in your Odoo `addons` path (or install via your preferred deployment pipeline).
2. Update Apps list.
3. Install `base_quick_groupby`.

> Note: No extra data files are required; the module registers QWeb templates and a JS patch through `web.assets_backend`.

## Usage

1. Open any list (tree) view that includes groupable fields (e.g., a text field, selection, Many2one).
2. In the header cell for a groupable column, click the small toggle button that appears to the right of the column label.
   - If the column is not groupable, the button will not be rendered.
3. Clicking the button:
   - If the list is not grouped by that column, the list reloads with `groupBy=[that_field]`.
   - If the list is already grouped by that column, the grouping is cleared (`groupBy=[]`).

### Manual test steps

1. Install the module.
2. Open a list view (e.g., `Contacts`).
3. Identify a non-relational, stored field column (e.g., `Country`, `Category`).
4. Click the group-by button in the column header.
5. Confirm the list reloads grouped by the selected field.
6. Click the same button to clear grouping.
7. Confirm relational fields (Many2many / One2many) do not show the button.

## Files of interest

- `__manifest__.py` — module metadata.
- `static/src/xml/list_header_cell.xml` — QWeb templates to inject the header button.
- `static/src/js/list_header_cell.js` — JS patch to `ListRenderer` (defines grouping logic and UI updates).
- `static/description/icon.png` — module icon (optional).

## Known limitations & design decisions

- This implementation supports only a single-level group (toggles `groupBy` to `[]` or `[field]`).
- It intentionally mirrors the behavior of the renderer-based implementation; it does not provide multi-level grouping from the header.
- If the server/field metadata is incomplete (e.g., no `store` info available), behavior falls back conservatively — the module avoids adding the button when metadata indicates the field is not safe to group by.
- Styling and icons use Font Awesome classes present in standard Odoo backends. If a custom theme changes icon classes, visual appearance may vary.

## Troubleshooting

- If the button does not appear:
  - Confirm the column is a `field` column (not a widget or template cell).
  - Confirm the field is stored and not `one2many`/`many2many`.
  - Confirm `web.assets_backend` includes the module assets in the built assets (clear browser cache and recompile assets if necessary).
- If icons are missing, ensure Font Awesome is available in your Odoo instance or adapt the template icons.
- Remove any leftover `console.log` debug prints before creating a PR.

## Testing & QA

- Manual tests described above are sufficient for this UI-focused module.
- For CI/automation: consider adding a basic JS integration test that:
  - Renders a simple list view,
  - Simulates a click on the header button,
  - Asserts that the model `groupBy` parameter was updated.
