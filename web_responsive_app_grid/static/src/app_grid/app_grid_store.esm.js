/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {browser} from "@web/core/browser/browser";
import {reactive} from "@odoo/owl";
import {user} from "@web/core/user";

export const MAX_COLS = 6;
const DESKTOP_COLS = 6;
const MOBILE_COLS = 4;
// Bootstrap "md".
const COLS_BREAKPOINT = 768;

/**
 * Columns per row for the current viewport width. Must match the
 * media-breakpoint-up(md) rule in app_grid.scss.
 */
export function gridCols() {
    return browser.innerWidth >= COLS_BREAKPOINT ? DESKTOP_COLS : MOBILE_COLS;
}

/**
 * Per-user home screen layout, persisted on `res.users.settings` as
 * `apps_menu_grid_layout`.
 *
 * The in-memory model is an ordered list of groups (logical rows). Each
 * group has a sparse map of cell index to app menu id,
 * `cells: {col: menuId}` with `col` in `0..MAX_COLS-1`, and an optional
 * `title` shown on the horizontal separator above it. A group that has
 * more occupied columns than fit the current viewport wraps onto extra
 * visual rows below, preserving relative order.
 */
export const appGridLayout = reactive({rows: [], loaded: false});

// -- Internal helpers -----------------------------------------------------

function _rowCell(rows, rowIndex, col) {
    const row = rows[rowIndex];
    return row ? row.cells[col] : undefined;
}

function _ensureRow(rows, rowIndex) {
    while (rows.length <= rowIndex) {
        rows.push({cells: {}, title: ""});
    }
}

/**
 * Remove `menuId` from whichever group holds it and return the position
 * it occupied, or null.
 */
function _takeOut(rows, menuId) {
    for (let r = 0; r < rows.length; r++) {
        for (const key of Object.keys(rows[r].cells)) {
            if (rows[r].cells[key] === menuId) {
                const col = Number(key);
                delete rows[r].cells[col];
                return {row: r, col};
            }
        }
    }
    return null;
}

function _insertAtNextRow(rows, rowIndex, menuId) {
    if (rowIndex >= rows.length) {
        rows.push({cells: {0: menuId}, title: ""});
        return;
    }
    const row = rows[rowIndex];
    for (let c = 0; c < MAX_COLS; c++) {
        if (row.cells[c] === undefined) {
            row.cells[c] = menuId;
            return;
        }
    }
    rows.splice(rowIndex, 0, {cells: {0: menuId}, title: ""});
}

function _moveCell(rows, from, to) {
    const moved = _rowCell(rows, from.row, from.col);
    if (moved === undefined || _rowCell(rows, to.row, to.col) !== undefined) {
        return;
    }
    _takeOut(rows, moved);
    _ensureRow(rows, to.row);
    rows[to.row].cells[to.col] = moved;
}

/**
 * Insert at (row, col), shifting occupied cells right inside the group;
 * the rightmost displaced cell overflows to the next group (packed at
 * its first free column, or a new group when there is none).
 */
function _insertAt(rows, from, to) {
    const moved = _rowCell(rows, from.row, from.col);
    if (moved === undefined || _rowCell(rows, to.row, to.col) === undefined) {
        return;
    }
    _takeOut(rows, moved);
    _ensureRow(rows, to.row);
    const row = rows[to.row];
    let carry = moved;
    for (let c = to.col; c < MAX_COLS; c++) {
        const displaced = row.cells[c];
        row.cells[c] = carry;
        if (displaced === undefined) {
            return;
        }
        carry = displaced;
    }
    _insertAtNextRow(rows, to.row + 1, carry);
}

/**
 * Split the group at `col`: cells at that column and after move into a
 * new group (packed from column 0) inserted right after.
 */
function _splitRow(rows, rowIndex, atCol) {
    const row = rows[rowIndex];
    if (!row) {
        return;
    }
    const moved = {};
    for (const key of Object.keys(row.cells)) {
        const col = Number(key);
        if (col >= atCol) {
            moved[col - atCol] = row.cells[col];
            delete row.cells[col];
        }
    }
    if (!Object.keys(moved).length) {
        return;
    }
    rows.splice(rowIndex + 1, 0, {cells: moved, title: "", sep: true});
}

// -- Layout model ---------------------------------------------------------

export function cellAt(rowIndex, col) {
    return _rowCell(appGridLayout.rows, rowIndex, col);
}

function pruneEmptyRows() {
    // Only trim trailing empties: interior empty rows are intentional
    // spacing the user created by dropping further down.
    let last = appGridLayout.rows.length - 1;
    while (last > 0) {
        const row = appGridLayout.rows[last];
        if (row.title || row.sep || Object.keys(row.cells).length) {
            break;
        }
        appGridLayout.rows.splice(last, 1);
        last--;
    }
}

/**
 * Reconcile the stored layout with the visible apps: new apps are
 * appended to the last group (or a new group), stale ids are pruned.
 */
export function reconcile(apps) {
    const known = new Set();
    for (const row of appGridLayout.rows) {
        for (const key of Object.keys(row.cells)) {
            known.add(row.cells[key]);
        }
    }
    const freeCol = () => {
        let last = appGridLayout.rows[appGridLayout.rows.length - 1];
        if (!last) {
            appGridLayout.rows.push({cells: {}, title: ""});
            last = appGridLayout.rows[appGridLayout.rows.length - 1];
        }
        for (let col = 0; col < MAX_COLS; col++) {
            if (last.cells[col] === undefined) {
                return col;
            }
        }
        appGridLayout.rows.push({cells: {}, title: ""});
        return 0;
    };
    for (const app of apps) {
        if (!known.has(app.id)) {
            const col = freeCol();
            appGridLayout.rows[appGridLayout.rows.length - 1].cells[col] = app.id;
            known.add(app.id);
        }
    }
    const available = new Set(apps.map((app) => app.id));
    for (const row of appGridLayout.rows) {
        for (const key of Object.keys(row.cells)) {
            if (!available.has(row.cells[key])) {
                delete row.cells[key];
            }
        }
    }
    pruneEmptyRows();
}

/**
 * Normalize the persisted payload into the current schema
 * (`{v: 2, rows: [{cells: {col: id}, title}]}`). A v1 payload with flat
 * cell indexes is converted using the desktop column count.
 */
function normalizeRows(raw) {
    if (!raw || typeof raw !== "object") {
        return [];
    }
    if (Array.isArray(raw.rows)) {
        return raw.rows.map((row) => ({
            cells: {...(row.cells || {})},
            title: row.title || "",
            // Titled rows get a separator; separators are otherwise added
            // explicitly, so bare rows render without one.
            sep: row.sep === undefined ? Boolean(row.title) : Boolean(row.sep),
        }));
    }
    if (raw.cells && typeof raw.cells === "object") {
        const rows = [];
        for (const [index, menuId] of Object.entries(raw.cells)) {
            const i = Number(index);
            const row = Math.floor(i / DESKTOP_COLS);
            while (rows.length <= row) {
                rows.push({cells: {}, title: "", sep: false});
            }
            rows[row].cells[i % DESKTOP_COLS] = menuId;
        }
        return rows;
    }
    return [];
}

export function ensureLayout(apps) {
    if (appGridLayout.loaded) {
        return;
    }
    appGridLayout.loaded = true;
    appGridLayout.rows = normalizeRows(user.settings.apps_menu_grid_layout);
    reconcile(apps);
}

export function saveLayout() {
    user.setUserSettings("apps_menu_grid_layout", {
        v: 2,
        rows: appGridLayout.rows,
    });
}

// -- Editing operations ---------------------------------------------------

export function moveCell(from, to) {
    _moveCell(appGridLayout.rows, from, to);
    pruneEmptyRows();
}

export function insertAt(from, to) {
    _insertAt(appGridLayout.rows, from, to);
    pruneEmptyRows();
}

function _splitDrop(rows, from, to) {
    const moved = _rowCell(rows, from.row, from.col);
    if (moved === undefined) {
        return;
    }
    _takeOut(rows, moved);
    _splitRow(rows, to.row, to.col);
    const newRow = rows[to.row + 1];
    if (!newRow) {
        return;
    }
    for (let c = 0; c < MAX_COLS; c++) {
        if (newRow.cells[c] === undefined) {
            newRow.cells[c] = moved;
            return;
        }
    }
}

/**
 * Drop a dragged icon onto a group boundary: split the group at the
 * boundary column, then place the dragged icon at the start of the new
 * group it just created.
 */
export function splitDrop(from, to) {
    _splitDrop(appGridLayout.rows, from, to);
    pruneEmptyRows();
}

function _sepDrop(rows, from, to) {
    _ensureRow(rows, to.row);
    rows[to.row].sep = true;
    const moved = _rowCell(rows, from.row, from.col);
    if (moved === undefined) {
        return;
    }
    _takeOut(rows, moved);
    const row = rows[to.row];
    for (let c = 0; c < MAX_COLS; c++) {
        if (row.cells[c] === undefined) {
            row.cells[c] = moved;
            return;
        }
    }
    _insertAtNextRow(rows, to.row + 1, moved);
}

/**
 * Drop near a row's top/bottom edge: flag a group boundary there and
 * place the dragged icon at the first free column of that group.
 */
export function sepDrop(from, to) {
    _sepDrop(appGridLayout.rows, from, to);
}

function _moveSep(rows, from, to) {
    const row = rows[from];
    if (!row) {
        return;
    }
    rows.splice(from, 1);
    rows.splice(to > from ? to - 1 : to, 0, row);
}

/**
 * Drag a separator to reorder groups: the row moves to boundary `to`
 * (before that row index).
 */
export function moveSep(from, to) {
    _moveSep(appGridLayout.rows, from, to);
}

/**
 * Remove the separator above a row: it becomes a plain row in the group
 * above (items keep their exact positions). The title is kept so it
 * comes back if a separator is re-added later.
 */
export function removeSeparator(rowIndex) {
    const row = appGridLayout.rows[rowIndex];
    if (row) {
        row.sep = false;
    }
}

export function setTitle(rowIndex, title) {
    const row = appGridLayout.rows[rowIndex];
    if (row) {
        row.title = title;
        // A named group implies a visible separator.
        row.sep = row.sep || Boolean(title);
    }
}

/**
 * Rows as they would look if the drop happened now, for live preview.
 * `from`/`target` are {row, col} positions; target kind is "move",
 * "insert" or "split". Does not mutate the real layout.
 */
export function previewRows(from, target) {
    const rows = appGridLayout.rows.map((row, i) => ({
        title: row.title,
        sep: row.sep,
        cells: {...row.cells},
        // Marks the dragged separator's row so it survives reordering
        // in the preview (keeps its DOM node pinned).
        __dragSep: Boolean(from && from.type === "sep" && i === from.row),
    }));
    if (target) {
        if (target.kind === "move") {
            _moveCell(rows, from, target);
        } else if (target.kind === "insert") {
            _insertAt(rows, from, target);
        } else if (target.kind === "split") {
            _splitDrop(rows, from, target);
        } else if (target.kind === "sep") {
            _sepDrop(rows, from, target);
        }
        // "sepMove" gets no preview mutation on purpose: reordering the
        // dragged sep's DOM node mid-gesture cancels the pointer
        // capture. The cue line and opening gap show the landing spot.
    }
    return rows;
}
