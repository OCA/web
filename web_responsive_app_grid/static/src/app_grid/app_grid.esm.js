/* License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {
    Component,
    onMounted,
    onPatched,
    onWillStart,
    useExternalListener,
    useRef,
    useState,
} from "@odoo/owl";
import {
    MAX_COLS,
    appGridLayout,
    cellAt,
    ensureLayout,
    gridCols,
    insertAt,
    moveCell,
    moveSep,
    previewRows,
    removeSeparator,
    saveLayout,
    sepDrop,
    setTitle,
    splitDrop,
} from "./app_grid_store.esm";
import {browser} from "@web/core/browser/browser";
import {closestScrollableY} from "@web/core/utils/scrolling";
import {getWebIconData} from "@web_responsive/components/apps_menu_tools.esm";
import {makeDraggableHook} from "@web/core/utils/draggable_hook_builder_owl";
import {pick} from "@web/core/utils/objects";
import {useService} from "@web/core/utils/hooks";
import {user} from "@web/core/user";

const useDraggable = makeDraggableHook({
    name: "useAppGridDraggable",
    onDragStart: ({ctx}) => pick(ctx.current, "element"),
    onDrag: ({ctx}) => pick(ctx.current, "element"),
    onDrop: ({ctx}) => pick(ctx.current, "element"),
    onDragEnd: ({ctx}) => pick(ctx.current, "element"),
});

export class AppGrid extends Component {
    setup() {
        super.setup();
        this.layout = appGridLayout;
        this.menuService = useService("menu");
        this.actionService = useService("action");
        this.gridRef = useRef("grid");
        this.titleInputRef = useRef("titleInput");
        this.state = useState({
            editing: false,
            dropTarget: null,
            previewRows: null,
            undoAvailable: false,
            titleRow: null,
            landedId: null,
            showHint: browser.localStorage.getItem("o_app_grid_hint") === null,
            cols: gridCols(),
        });
        useExternalListener(browser, "resize", () => {
            this.state.cols = gridCols();
        });
        useExternalListener(browser, "keydown", (ev) => {
            if (
                ev.key === "Escape" &&
                this.state.editing &&
                !ev.target.closest("input")
            ) {
                this.stopEditing();
            }
        });
        this._dragSource = null;
        this._undoStack = [];
        onWillStart(() => ensureLayout(this.menuService.getApps()));
        onMounted(() => {
            if (this.state.showHint) {
                browser.localStorage.setItem("o_app_grid_hint", "1");
                this._hintTimer = browser.setTimeout(() => {
                    this.state.showHint = false;
                }, 6000);
            }
        });
        const handlers = {
            onDragStart: ({element}) => this.onDragStart(element),
            onDrag: ({x, y}) => this.onDrag(x, y),
            onDrop: () => this.onDrop(),
            onDragEnd: () => this.onDragEnd(),
        };
        // In edit mode icons and separators drag immediately.
        useDraggable({
            ref: this.gridRef,
            elements: ".o_app_grid__item, .o_app_grid__sep",
            enable: () => this.state.editing,
            cursor: "grabbing",
            ...handlers,
        });
        // Out of edit mode, pressing and holding an icon starts dragging
        // it in the same gesture (and enters edit mode via onDragStart).
        useDraggable({
            ref: this.gridRef,
            elements: ".o_app_grid__item",
            // `enable` is re-checked during the gesture: stay enabled
            // once a drag is in flight, or flipping `editing` on in
            // onDragStart would abort it.
            enable: () => !this.state.editing || this._dragSource !== null,
            delay: 500,
            touchDelay: 500,
            cursor: "grabbing",
            ...handlers,
        });
        onPatched(() => this._animateShift());
    }

    // -- Layout model ----------------------------------------------------

    get appMap() {
        if (!this._appMap) {
            this._appMap = new Map(
                this.menuService.getApps().map((app) => [app.id, app])
            );
        }
        return this._appMap;
    }

    /**
     * Everything the template renders, in visual grid coordinates.
     *
     * Each group renders as: a full-width separator row (except the
     * first group), then ceil(MAX_COLS / cols) slot rows. An icon at
     * logical column `c` lands on visual column `c % cols` of row
     * `floor(c / cols)`, so columns are preserved for the first `cols`
     * positions and the rest overflow onto extra rows below.
     */
    get visualModel() {
        const rows = this.state.previewRows || appGridLayout.rows;
        const cols = this.state.cols;
        const slotRows = Math.ceil(MAX_COLS / cols);
        const model = {cells: [], seps: [], items: []};
        let vRow = 1;
        let itemIndex = 0;
        const draggedMenuId =
            this._dragSource === null
                ? null
                : cellAt(this._dragSource.row, this._dragSource.col);
        const target = this.state.dropTarget;
        const cueSepRow =
            target && target.kind === "split"
                ? target.row + 1
                : target && target.kind === "sep"
                  ? target.row
                  : null;
        if (target && target.kind === "sepMove") {
            model.sepCue = {
                style: `grid-row: ${1 + target.row * slotRows}; grid-column: 1 / -1;`,
            };
        }
        rows.forEach((row, g) => {
            if (row.sep) {
                const isDragged =
                    Boolean(row.__dragSep) ||
                    (this._dragSource !== null &&
                        this._dragSource.type === "sep" &&
                        g === this._dragSource.row);
                // The dragged separator is pinned at its origin so Owl
                // never rewrites the node the drag hook is tracking.
                model.seps.push({
                    row: g,
                    title: row.title,
                    classes: g === cueSepRow ? "o_sep_cue" : "",
                    // Key must never change mid-drag: a new key means a
                    // new DOM node and the gesture dies instantly.
                    key: `sep-${g}`,
                    fromRow: isDragged ? this._dragSource.row : g,
                    style: `grid-row: ${
                        isDragged ? 1 + this._dragSource.row * slotRows : vRow
                    }; grid-column: 1 / -1;`,
                });
            }
            // A sepMove hover opens a gap at the landing boundary.
            const gap = target && target.kind === "sepMove" && g === target.row;
            const margin = (row.sep ? 1.5 : 0) + (gap ? 1 : 0);
            const topMargin = margin ? ` margin-top: ${margin}rem;` : "";
            for (let r = 0; r < slotRows; r++) {
                for (let c = 0; c < cols; c++) {
                    const col = r * cols + c;
                    if (col >= MAX_COLS) {
                        break;
                    }
                    model.cells.push({
                        row: g,
                        col,
                        classes: this.cellClasses(g, col),
                        ghost: this._cellGhost(g, col),
                        style:
                            `grid-row: ${vRow + r}; grid-column: ${c + 1};` +
                            (r === 0 ? topMargin : ""),
                    });
                }
            }
            for (const key of Object.keys(row.cells)) {
                const col = Number(key);
                const menuId = row.cells[col];
                const isDragged = menuId === draggedMenuId;
                // The dragged item is pinned at its origin so Owl never
                // rewrites the node the drag hook is tracking.
                const pos = isDragged ? this._dragSource : {row: g, col};
                const posRow = rows[pos.row] || row;
                const app = this.appMap.get(menuId);
                if (!app) {
                    continue;
                }
                const itemMargin =
                    (posRow.sep ? 1.5 : 0) + (gap && pos.row === target.row ? 1 : 0);
                model.items.push({
                    menuId,
                    row: pos.row,
                    col: pos.col,
                    href: `/odoo/${app.actionPath || "action-" + app.actionID}`,
                    icon: getWebIconData(app),
                    name: app.name,
                    style:
                        this._posStyle(1 + pos.row * slotRows, pos.col) +
                        (itemMargin && Math.floor(pos.col / cols) === 0
                            ? ` margin-top: ${itemMargin}rem;`
                            : "") +
                        // Staggered cascade-in outside edit mode.
                        (this.state.editing
                            ? ""
                            : ` animation-delay: ${Math.min(itemIndex * 30, 300)}ms;`),
                });
                itemIndex++;
            }
            vRow += slotRows;
        });
        // Spare empty rows below the last group so drops can land
        // further down, leaving empty rows in between.
        if (this.state.editing) {
            for (let g = rows.length; g < rows.length + 2; g++) {
                const gap = target && target.kind === "sepMove" && g === target.row;
                for (let r = 0; r < slotRows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const col = r * cols + c;
                        if (col >= MAX_COLS) {
                            break;
                        }
                        model.cells.push({
                            row: g,
                            col,
                            classes: this.cellClasses(g, col),
                            style:
                                `grid-row: ${vRow + r}; grid-column: ${c + 1};` +
                                (r === 0 && gap ? " margin-top: 1rem;" : ""),
                        });
                    }
                }
                vRow += slotRows;
            }
        }
        return model;
    }

    /**
     * Grid-area style for an item sitting in logical (base vRow, col).
     * The column maps to the same visual position as its slot cell.
     */
    _posStyle(vRow, col) {
        const cols = this.state.cols;
        return `grid-row: ${vRow + Math.floor(col / cols)}; grid-column: ${
            (col % cols) + 1
        };`;
    }

    cellClasses(row, col) {
        const target = this.state.dropTarget;
        const isSource =
            this._dragSource &&
            this._dragSource.row === row &&
            this._dragSource.col === col;
        if (!target || isSource || target.row !== row || target.col !== col) {
            return "";
        }
        return "o_drop_move";
    }

    /**
     * Ghost icon to render inside the landing cell, so the slot the
     * dragged icon will occupy shows a faded copy of it.
     */
    _cellGhost(row, col) {
        const target = this.state.dropTarget;
        if (
            !target ||
            target.row !== row ||
            target.col !== col ||
            target.kind === "split" ||
            this._dragSource === null
        ) {
            return null;
        }
        const app = this.appMap.get(cellAt(this._dragSource.row, this._dragSource.col));
        return app ? getWebIconData(app) : null;
    }

    // -- Edit-mode actions -------------------------------------------------

    stopEditing() {
        this.state.editing = false;
        this.state.undoAvailable = false;
        this._undoStack = [];
        this.state.titleRow = null;
        this._longPressed = false;
        saveLayout();
    }

    /**
     * Open the App Menu Preferences dialog for the current user — the
     * same action the (now hidden) systray shortcut uses.
     */
    async onOptionsClick() {
        const action = await this.actionService.loadAction(
            "web_responsive.res_users_view_form_apps_menu_preferences_action"
        );
        const onClose = () => this.actionService.doAction("reload_context");
        this.actionService.doAction({...action, res_id: user.userId}, {onClose});
    }

    /**
     * Discard the last drop: restore the groups as they were before it.
     */
    onDiscardClick() {
        const snapshot = this._undoStack.pop();
        if (!snapshot) {
            return;
        }
        appGridLayout.rows = snapshot;
        this.state.undoAvailable = this._undoStack.length > 0;
        saveLayout();
        // AppGridLayout writes don't reliably trigger a render.
        this.render();
    }

    /**
     * Add an empty group boundary at the bottom of the grid.
     */
    onAddGroup() {
        this._undoStack.push(
            appGridLayout.rows.map((row) => ({
                title: row.title,
                sep: row.sep,
                cells: {...row.cells},
            }))
        );
        this.state.undoAvailable = true;
        appGridLayout.rows.push({cells: {}, title: "", sep: true});
        saveLayout();
        this.render();
    }

    // -- Separator / group actions -----------------------------------------

    onSepDblClick(row) {
        if (this.state.editing) {
            this.state.titleRow = row;
        }
    }

    onTitleCommit(row, ev) {
        // Enter commits, then blur fires again — skip the second run.
        if (this.state.titleRow === null) {
            return;
        }
        setTitle(row, ev.target.value.trim());
        this.state.titleRow = null;
        saveLayout();
    }

    onTitleKeydown(row, ev) {
        if (ev.key === "Enter") {
            this.onTitleCommit(row, ev);
        } else if (ev.key === "Escape") {
            this.state.titleRow = null;
        }
    }

    onRemoveGroup(row) {
        this._undoStack.push(
            appGridLayout.rows.map((r) => ({
                title: r.title,
                sep: r.sep,
                cells: {...r.cells},
            }))
        );
        this.state.undoAvailable = true;
        removeSeparator(row);
        saveLayout();
        this.render();
    }

    // -- Long-press edit mode ----------------------------------------------

    /**
     * Long-press (500ms without moving) anywhere on the canvas enters
     * edit mode, phone home screen style.
     */
    onPointerDown(ev) {
        if (
            this.state.editing ||
            (ev.button && ev.button !== 0) ||
            ev.target.closest("input, button, .o_app_grid__item")
        ) {
            return;
        }
        this._longPressPoint = {x: ev.clientX, y: ev.clientY};
        this._longPressTimer = browser.setTimeout(() => {
            this._longPressTimer = null;
            this._longPressed = true;
            this.state.editing = true;
            this.state.showHint = false;
            if (browser.navigator.vibrate) {
                browser.navigator.vibrate(10);
            }
        }, 500);
    }

    onPointerMove(ev) {
        const point = this._longPressPoint;
        if (
            this._longPressTimer &&
            point &&
            Math.hypot(ev.clientX - point.x, ev.clientY - point.y) > 10
        ) {
            this.cancelLongPress();
        }
    }

    cancelLongPress() {
        if (this._longPressTimer) {
            browser.clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
        this._longPressPoint = null;
    }

    /**
     * In edit mode, tapping an empty area of the canvas exits. The click
     * ending a long-press is ignored, or edit mode would exit as soon as
     * the press is released on an empty cell.
     */
    onCanvasClick(ev) {
        if (!this.state.editing) {
            return;
        }
        if (this._longPressed) {
            this._longPressed = false;
            return;
        }
        if (!ev.target.closest(".o_app_grid__item, .o_app_grid__sep, button, input")) {
            this.stopEditing();
        }
    }

    // -- View mode interactions --------------------------------------------

    onItemClick(ev) {
        if (this.state.editing) {
            ev.preventDefault();
        }
    }

    // -- Drag & drop --------------------------------------------------------

    onDragStart(element) {
        this.state.editing = true;
        this._dragSource = element.classList.contains("o_app_grid__sep")
            ? {type: "sep", row: Number(element.dataset.fromRow)}
            : {
                  row: Number(element.dataset.fromRow),
                  col: Number(element.dataset.fromCol),
              };
        this.state.showHint = false;
        if (browser.navigator.vibrate) {
            browser.navigator.vibrate(10);
        }
    }

    /**
     * Cell rects snapshot, built lazily on the first onDrag: the spare
     * edit-mode rows render after onDragStart's patch, so caching in
     * onDragStart would miss them.
     */
    _ensureCellRects() {
        if (this._cellRects) {
            return;
        }
        const cells =
            this.gridRef.el && this.gridRef.el.querySelector(".o_app_grid__cells");
        this._cellRects = cells
            ? [...cells.querySelectorAll(".o_app_grid__cell")].map((cell) => ({
                  row: Number(cell.dataset.row),
                  col: Number(cell.dataset.col),
                  rect: cell.getBoundingClientRect(),
              }))
            : [];
        this._scrollParent = this.gridRef.el
            ? closestScrollableY(this.gridRef.el)
            : null;
        this._scrollY0 = this._scrollParent ? this._scrollParent.scrollTop : 0;
    }

    onDrag(x, y) {
        this._ensureCellRects();
        const target = this._resolveDropTarget(x, y);
        // Group-boundary targets only reveal after a short pause, iOS
        // style, so gliding over an edge doesn't flash the cue.
        if (target && (target.kind === "split" || target.kind === "sep")) {
            const pending = this._edgeTarget;
            if (
                !pending ||
                pending.kind !== target.kind ||
                pending.row !== target.row ||
                pending.col !== target.col
            ) {
                this._edgeTarget = target;
                browser.clearTimeout(this._edgeTimer);
                this._edgeTimer = browser.setTimeout(() => {
                    this._edgeTarget = null;
                    this._applyDropTarget(target);
                }, 600);
            }
            return;
        }
        this._edgeTarget = null;
        browser.clearTimeout(this._edgeTimer);
        this._applyDropTarget(target);
    }

    _applyDropTarget(target) {
        const prev = this.state.dropTarget;
        const changed =
            (target === null) !== (prev === null) ||
            (target &&
                prev &&
                (target.kind !== prev.kind ||
                    target.row !== prev.row ||
                    target.col !== prev.col ||
                    target.side !== prev.side));
        this.state.dropTarget = target;
        if (changed) {
            this._flipRects = this._snapshotRects();
            this.state.previewRows = previewRows(this._dragSource, target);
        }
    }

    /**
     * Resolve a drop target from pointer coordinates by measuring the
     * rendered slot cells (elementFromPoint is unusable while the hook
     * sets `pe-none` on <body>).
     *
     * A free cell is a "move" target. An occupied cell is an "insert"
     * target — except near its left/right edge, where it becomes a
     * "split" target that draws a vertical cue and creates a new group
     * boundary on drop.
     */
    _resolveDropTarget(x, y) {
        const rects = this._cellRects || [];
        const scrollDelta = this._scrollParent
            ? this._scrollParent.scrollTop - this._scrollY0
            : 0;
        let best = null;
        let bestDist = Infinity;
        for (const {row, col, rect} of rects) {
            const top = rect.top - scrollDelta;
            const bottom = rect.bottom - scrollDelta;
            const dx = Math.max(rect.left - x, 0, x - rect.right);
            const dy = Math.max(top - y, 0, y - bottom);
            const dist = Math.hypot(dx, dy);
            if (dist < bestDist) {
                bestDist = dist;
                best = {row, col, rect};
            }
        }
        if (!best || bestDist > best.rect.width) {
            return null;
        }
        const {row, col} = best;
        const bestRect = best.rect;
        const relX = (x - bestRect.left) / bestRect.width;
        const relY = (y - (bestRect.top - scrollDelta)) / bestRect.height;
        // Dragging a separator: resolve to the row boundary it should
        // land on (before that row).
        if (this._dragSource && this._dragSource.type === "sep") {
            return {
                kind: "sepMove",
                from: this._dragSource.row,
                row: relY < 0.5 ? row : row + 1,
            };
        }
        // Top/bottom row edges: insert a group boundary there.
        if (relY < 0.15) {
            return {kind: "sep", row};
        }
        if (relY > 0.85) {
            return {kind: "sep", row: row + 1};
        }
        if (cellAt(row, col) === undefined) {
            return {kind: "move", row, col};
        }
        if (relX < 0.3 && col > 0) {
            return {kind: "split", row, col, side: "before"};
        }
        if (relX > 0.7 && col < MAX_COLS - 1) {
            return {kind: "split", row, col: col + 1, side: "after"};
        }
        return {kind: "insert", row, col};
    }

    onDrop() {
        const source = this._dragSource;
        const target = this.state.dropTarget;
        const samePos =
            target && source && source.row === target.row && source.col === target.col;
        const noOpSepMove =
            target &&
            source &&
            target.kind === "sepMove" &&
            target.row === source.row + 1;
        if (source !== null && target && !samePos && !noOpSepMove) {
            const movedId =
                source.type === "sep" ? null : cellAt(source.row, source.col);
            this._undoStack.push(
                appGridLayout.rows.map((row) => ({
                    title: row.title,
                    sep: row.sep,
                    cells: {...row.cells},
                }))
            );
            this.state.undoAvailable = true;
            this._flipRects = this._snapshotRects();
            if (target.kind === "move") {
                moveCell(source, target);
            } else if (target.kind === "insert") {
                insertAt(source, target);
            } else if (target.kind === "split") {
                splitDrop(source, target);
            } else if (target.kind === "sep") {
                sepDrop(source, target);
            } else if (target.kind === "sepMove") {
                moveSep(source.row, target.row);
            }
            this.state.landedId = movedId;
            browser.setTimeout(() => {
                this.state.landedId = null;
            }, 250);
            saveLayout();
        }
        this.onDragEnd();
    }

    onDragEnd() {
        this._dragSource = null;
        this._edgeTarget = null;
        this._cellRects = null;
        browser.clearTimeout(this._edgeTimer);
        this.state.dropTarget = null;
        this.state.previewRows = null;
    }

    // -- FLIP animation -----------------------------------------------------

    /**
     * Positions of all app icons, keyed by menu id. Taken before a layout
     * mutation so the shift can be animated afterwards.
     */
    _snapshotRects() {
        const rects = new Map();
        const el = this.gridRef.el;
        if (el) {
            for (const item of el.querySelectorAll(".o_app_grid__item[data-menu-id]")) {
                rects.set(item.dataset.menuId, item.getBoundingClientRect());
            }
        }
        return rects;
    }

    /**
     * FLIP: after Owl patches the grid, icons whose position changed get
     * inverted-transformed back to their old spot and transitioned to
     * their new one.
     */
    _animateShift() {
        if (this.titleInputRef.el) {
            this.titleInputRef.el.focus();
            this.titleInputRef.el.select();
        }
        const previous = this._flipRects;
        if (!previous || !this.gridRef.el) {
            return;
        }
        this._flipRects = null;
        for (const item of this.gridRef.el.querySelectorAll(
            ".o_app_grid__item[data-menu-id]"
        )) {
            const before = previous.get(item.dataset.menuId);
            if (!before || item.classList.contains("o_dragged")) {
                continue;
            }
            const after = item.getBoundingClientRect();
            const dx = before.left - after.left;
            const dy = before.top - after.top;
            if (!dx && !dy) {
                continue;
            }
            item.style.transition = "none";
            // `translate` is a separate property from `transform`, so the
            // edit-mode float animation doesn't override the FLIP shift.
            item.style.translate = `${dx}px ${dy}px`;
            item.getBoundingClientRect();
            item.style.transition = "translate 0.25s cubic-bezier(0.34, 1.4, 0.64, 1)";
            item.style.translate = "";
            // Do not leave the inline transition behind: it would smooth
            // the hook's position updates and lag a later drag.
            setTimeout(() => {
                item.style.transition = "";
            }, 300);
        }
    }
}

Object.assign(AppGrid, {
    template: "web_responsive_app_grid.AppGrid",
    props: {},
});
