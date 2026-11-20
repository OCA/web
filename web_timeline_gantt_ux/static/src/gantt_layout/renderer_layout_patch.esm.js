/** @odoo-module **/

import {TimelineRenderer} from "@web_timeline/views/timeline/timeline_renderer.esm";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

const {DateTime} = luxon;

const WINDOW_BEFORE_DAYS = 7;
const WINDOW_AFTER_DAYS = 35;
const GHOST_CHIP_DAYS = 2;

/**
 * Pure group-building for gantt mode: one collapsible parent group per
 * group-by value, one child row per record. Exported for DOM-free tests.
 *
 * @param {Object[]} records loaded records
 * @param {String} groupedField group-by field name
 * @param {Set<String>} collapsedIds parent group ids to render collapsed
 * @param {String} dateStartField record field marking a scheduled record
 * @returns {Object[]} vis groups (parents first, then rows)
 */
export function buildGanttGroups(records, groupedField, collapsedIds, dateStartField) {
    const parents = new Map();
    const recordsByParent = new Map();
    let seq = 0;
    for (const rec of records) {
        let val = rec[groupedField];
        if (val && !Array.isArray(val)) {
            val = false;
        }
        const pid = val ? `grp_${val[0]}` : "grp_unassigned";
        if (!parents.has(pid)) {
            // M2o values are [id, name]; m2m values are bare id lists (first
            // value only, documented limitation) with no name to show.
            const label =
                val && typeof val[1] === "string" ? val[1] : val ? `#${val[0]}` : "";
            parents.set(pid, {
                id: pid,
                name: val ? label : _t("Unassigned"),
                order: val ? ++seq : -1,
                nestedGroups: [],
                showNested: !collapsedIds.has(pid),
                className: "o_tlg_project_row",
            });
            recordsByParent.set(pid, []);
        }
        recordsByParent.get(pid).push(rec);
    }
    // The fetch is ordered by the group-by field ONLY — within a parent the
    // database returns ties in arbitrary, plan-dependent order, so any
    // reload (a bar drag, a dependency write) could shuffle rows. Impose a
    // stable in-parent order instead of trusting fetch order.
    const rows = [];
    for (const [pid, recs] of recordsByParent) {
        recs.sort((a, b) => a.id - b.id);
        const parent = parents.get(pid);
        for (const rec of recs) {
            parent.nestedGroups.push(`rec_${rec.id}`);
            const unscheduled = !rec[dateStartField];
            rows.push({
                id: `rec_${rec.id}`,
                // Task names live on the bars (the item template overflows
                // the pill), not in the sidebar — rows are blank alignment
                // tracks.
                content: "",
                title: rec.display_name || `#${rec.id}`,
                order: rows.length,
                // Always set: vis styles unknown levels with a red border.
                treeLevel: 1,
                className: `o_tlg_task_row${unscheduled ? " o_tlg_unscheduled" : ""}`,
            });
        }
    }
    for (const parent of parents.values()) {
        parent.content = `${parent.name} <span class="o_tlg_count">(${parent.nestedGroups.length})</span>`;
        delete parent.name;
    }
    return [...parents.values(), ...rows];
}

patch(TimelineRenderer.prototype, {
    get ganttUx() {
        return Boolean(this.params.gantt_ux);
    },

    // ------------------------------------------------------------------
    // Collapse persistence (session: harvested from the live timeline;
    // across visits: localStorage keyed by model + group-by field)
    // ------------------------------------------------------------------

    _ganttStorageKey() {
        return `o_tlg_collapsed:${this.model.model_name}:${this.model.last_group_bys[0]}`;
    },

    _ganttCollapsedIds() {
        const groups = this.timeline?.itemSet?.groups;
        if (groups && Object.keys(groups).length) {
            const collapsed = new Set();
            for (const [gid, group] of Object.entries(groups)) {
                if (group.nestedGroups?.length && group.showNested === false) {
                    collapsed.add(gid);
                }
            }
            return collapsed;
        }
        try {
            const raw = window.localStorage.getItem(this._ganttStorageKey());
            return new Set(raw ? JSON.parse(raw) : []);
        } catch {
            return new Set();
        }
    },

    _ganttSaveCollapsed() {
        const collapsed = this._ganttCollapsedIds();
        try {
            window.localStorage.setItem(
                this._ganttStorageKey(),
                JSON.stringify([...collapsed])
            );
        } catch {
            // Storage unavailable (private mode/quota): session-only.
        }
    },

    // ------------------------------------------------------------------
    // Groups
    // ------------------------------------------------------------------

    async split_groups(records) {
        if (!this.ganttUx || this.model.last_group_bys.length === 0) {
            return super.split_groups(...arguments);
        }
        return buildGanttGroups(
            records,
            this.model.last_group_bys[0],
            this._ganttCollapsedIds(),
            this.date_start
        );
    },

    // ------------------------------------------------------------------
    // Window ownership: the stock renderer re-fits after every data load
    // and re-windows on mount, which would clobber any initial window and
    // recenter the view after each edit.
    // ------------------------------------------------------------------

    async on_data_loaded(records, adjust_window) {
        if (!this.ganttUx) {
            return super.on_data_loaded(records, adjust_window);
        }
        // Best-effort vertical-scroll preservation: setGroups can nudge the
        // internal scroll position (vis-internal state, hence the guards).
        const scrollTop = this.timeline?.props?.scrollTop;
        await super.on_data_loaded(records, false);
        this._ganttSpans = this._ganttComputeSpans(records);
        this._ganttSyncSyntheticItems(records);
        if (typeof scrollTop === "number" && this.timeline?.props) {
            this.timeline.props.scrollTop = scrollTop;
        }
        return undefined;
    },

    on_attach_callback() {
        if (!this.ganttUx) {
            return super.on_attach_callback(...arguments);
        }
        // Let the stock callback size the widget, then take the window over.
        super.on_attach_callback(...arguments);
        if (this.timeline && !this._ganttWindowSet) {
            const today = DateTime.now().startOf("day");
            this.timeline.setWindow(
                today.minus({days: WINDOW_BEFORE_DAYS}).toJSDate(),
                today.plus({days: WINDOW_AFTER_DAYS}).toJSDate(),
                {animation: false}
            );
            this._ganttWindowSet = true;
        }
        return undefined;
    },

    // ------------------------------------------------------------------
    // Synthetic items: "unscheduled" ghost chips (generic-only path) and
    // Enterprise-style rollup bands on collapsed parents. Both are
    // non-editable and carry string ids, keeping them out of the
    // dependency loop (which resolves numeric record ids only).
    // ------------------------------------------------------------------

    _ganttComputeSpans(records) {
        const groupedField = this.model.last_group_bys[0];
        const spans = new Map();
        for (const rec of records) {
            const start = rec[this.date_start];
            if (!start) {
                continue;
            }
            const val = rec[groupedField];
            const pid = Array.isArray(val) ? `grp_${val[0]}` : "grp_unassigned";
            const item = this.timeline.itemsData.get(rec.id);
            if (!item) {
                continue;
            }
            const end = item.end || item.start;
            const span = spans.get(pid);
            if (!span) {
                spans.set(pid, {min: item.start, max: end});
            } else {
                if (item.start < span.min) {
                    span.min = item.start;
                }
                if (end > span.max) {
                    span.max = end;
                }
            }
        }
        return spans;
    },

    _ganttSyncSyntheticItems(records) {
        const data = this.timeline.itemsData;
        if (!data) {
            return;
        }
        const stale = data
            .getIds()
            .filter(
                (id) =>
                    typeof id === "string" &&
                    (id.startsWith("ghost_") || id.startsWith("rollup_"))
            );
        if (stale.length) {
            data.remove(stale);
        }
        const additions = [];
        // Ghost chips for unscheduled records (no start date).
        if (records) {
            const windowStart = DateTime.fromJSDate(
                this.timeline.getWindow().start
            ).startOf("day");
            for (const rec of records) {
                if (rec[this.date_start]) {
                    continue;
                }
                additions.push({
                    id: `ghost_${rec.id}`,
                    group: `rec_${rec.id}`,
                    start: windowStart.toJSDate(),
                    end: windowStart.plus({days: GHOST_CHIP_DAYS}).toJSDate(),
                    // The chip is the record's only label now that sidebar
                    // rows are blank.
                    content: rec.display_name || `#${rec.id}`,
                    title: _t("No planned dates yet — set them in the task form"),
                    className: "o_tlg_ghost_chip",
                    editable: false,
                    selectable: false,
                });
            }
        }
        // Rollup bands on collapsed parents.
        const collapsed = this._ganttCollapsedIds();
        for (const pid of collapsed) {
            const span = this._ganttSpans?.get(pid);
            if (!span) {
                continue;
            }
            additions.push({
                id: `rollup_${pid}`,
                group: pid,
                start: span.min,
                end: span.max,
                content: "",
                className: "o_tlg_rollup",
                editable: false,
                selectable: false,
            });
        }
        if (additions.length) {
            data.add(additions);
        }
    },

    // ------------------------------------------------------------------
    // Timeline init / clicks
    // ------------------------------------------------------------------

    init_timeline() {
        super.init_timeline(...arguments);
        if (!this.ganttUx) {
            return;
        }
        // Row-per-record: moving a bar to another row would mean
        // "re-identify the record" — never write the group-by from a drag.
        this.timeline.setOptions({
            editable: {...this.options.editable, updateGroup: false},
        });
        if (this.rootRef.el) {
            this.rootRef.el.classList.add("o_timeline_gantt");
        }
    },

    on_timeline_click(e) {
        if (!this.ganttUx) {
            return super.on_timeline_click(...arguments);
        }
        if (e.what === "group-label" && typeof e.group === "string") {
            if (e.group.startsWith("rec_")) {
                // Sidebar task-name click: open the record.
                this.props.onItemDoubleClick({
                    item: parseInt(e.group.slice(4), 10),
                });
            } else {
                // Parent band: vis already toggled the collapse — persist it
                // and refresh the rollup bands.
                this._ganttSaveCollapsed();
                this._ganttSyncSyntheticItems(this.model.data);
            }
            return undefined;
        }
        return super.on_timeline_click(...arguments);
    },

    // ------------------------------------------------------------------
    // Dependency arrows: Bézier curves predecessor-end → successor-start
    // (Enterprise semantic; the stock code draws the reverse), skipping
    // items hidden by collapsed groups. Fixes the stock loop's
    // return-instead-of-continue bug along the way.
    // ------------------------------------------------------------------

    draw_dependencies() {
        if (!this.ganttUx) {
            return super.draw_dependencies(...arguments);
        }
        const items = this.timeline?.itemSet?.items;
        const datas = this.timeline?.itemsData;
        if (!items || !datas) {
            return;
        }
        const interactive = this.depEditEnabled === true;
        for (const key of Object.keys(items)) {
            const successor = items[key];
            const recordId = Number(key);
            if (!Number.isInteger(recordId)) {
                continue;
            }
            const data = datas.get(recordId);
            if (!data || !data.evt) {
                continue;
            }
            for (const predId of data.evt[this.dependency_arrow] || []) {
                const predecessor = items[predId];
                if (!predecessor || !predecessor.displayed || !successor.displayed) {
                    continue;
                }
                const fromEl = predecessor.dom?.box || predecessor.dom?.point;
                const toEl = successor.dom?.box || successor.dom?.point;
                if (!fromEl?.isConnected || !toEl?.isConnected) {
                    continue;
                }
                const predName = datas.get(predId)?.evt?.display_name || predId;
                const succName = data.evt.display_name || data.id;
                this.canvas.drawDependencyCurve(fromEl, toEl, {
                    predecessorId: predId,
                    successorId: data.id,
                    label: _t('"%s" is blocked by "%s"', succName, predName),
                    interactive,
                });
            }
        }
        // Dependency-edit module hook: pending (in-flight) arrows must be
        // re-drawn on every pass because the canvas is cleared each redraw.
        this._ganttDrawPendingDeps?.();
    },
});
