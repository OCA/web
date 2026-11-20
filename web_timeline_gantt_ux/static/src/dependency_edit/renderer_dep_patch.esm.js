/** @odoo-module **/

import {onWillUnmount} from "@odoo/owl";
import {TimelineRenderer} from "@web_timeline/views/timeline/timeline_renderer.esm";
import {DependencyLinkDragger} from "@web_timeline_gantt_ux/dependency_edit/dependency_link_dragger.esm";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

const NEW_HIGHLIGHT_MS = 1500;

patch(TimelineRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        this.tlgNotification = useService("notification");
        // In-flight dependency writes, re-drawn as dashed pending curves on
        // every canvas pass (the canvas is wiped on each vis "changed").
        this.pendingDeps = new Map();
        // Recently created pairs, highlighted for a short while.
        this.newDeps = new Set();
        onWillUnmount(() => this.linkDragger?.destroy());
    },

    get depEditEnabled() {
        return Boolean(this.ganttUx && this.dependency_arrow && this.model.canEdit);
    },

    /**
     * Feature gating: when the model exposes the standard Odoo
     * allow_task_dependencies related field, respect it per record — a link
     * created on a gated project would be invisible in the task form.
     *
     * @param {Object} record loaded record
     * @returns {Boolean}
     */
    _tlgCanLink(record) {
        if (!record) {
            return false;
        }
        if ("allow_task_dependencies" in (this.model.fields || {})) {
            return Boolean(record.allow_task_dependencies);
        }
        return true;
    },

    init_timeline() {
        super.init_timeline(...arguments);
        if (!this.depEditEnabled) {
            return;
        }
        this.rootRef.el?.classList.add("o_tlg_dep_editable");
        const overlay = document.createElement("div");
        overlay.className = "o_tlg_overlay";
        this.timeline.dom.centerContainer.appendChild(overlay);
        this.linkDragger = new DependencyLinkDragger({
            timeline: this.timeline,
            canvasSvg: this.canvas_ref,
            overlayEl: overlay,
            rootEl: this.rootRef.el,
            depField: this.dependency_arrow,
            getRecord: (id) => this.timeline.itemsData?.get(id)?.evt,
            canLink: (record) => this._tlgCanLink(record),
            isPending: (predecessorId, successorId) =>
                this.pendingDeps.has(`${predecessorId}->${successorId}`),
            onCreateDependency: ({predecessorId, successorId}) =>
                this._ganttCreateDependency(predecessorId, successorId),
            notify: (message, type) => this.tlgNotification.add(message, {type}),
        });
        this.timeline.on("itemover", (e) => this.linkDragger.onItemOver(e.item));
        this.timeline.on("itemout", () => this.linkDragger.onItemOut());
        this.timeline.on("changed", () => this.linkDragger.onTimelineChanged());
        // Arrow removal: delegated on the SVG root (events bubble from the
        // strokes even though the root itself is pointer-events: none).
        this.canvas_ref.addEventListener("click", (ev) => this._tlgOnArrowActivate(ev));
        this.canvas_ref.addEventListener("keydown", (ev) => {
            if (ev.key === "Delete") {
                this._tlgOnArrowActivate(ev);
            }
        });
    },

    _tlgOnArrowActivate(ev) {
        const hit = ev.target.closest?.("path.o_tlg_dep_hit");
        if (!hit || !this.props.onRemoveDependency) {
            return;
        }
        ev.stopPropagation();
        this.props.onRemoveDependency({
            predecessorId: Number(hit.dataset.predecessorId),
            successorId: Number(hit.dataset.successorId),
        });
    },

    /**
     * Wrap the controller write with the pending/highlight lifecycle. The
     * pair is locked while in flight (validateLink checks isPending).
     *
     * @param {Number} predecessorId
     * @param {Number} successorId
     */
    async _ganttCreateDependency(predecessorId, successorId) {
        if (!this.props.onCreateDependency) {
            return;
        }
        const key = `${predecessorId}->${successorId}`;
        if (this.pendingDeps.has(key)) {
            return;
        }
        this.pendingDeps.set(key, {predecessorId, successorId});
        this.draw_canvas();
        let created = false;
        try {
            created = await this.props.onCreateDependency({
                predecessorId,
                successorId,
            });
        } finally {
            this.pendingDeps.delete(key);
        }
        if (created) {
            this.newDeps.add(key);
            setTimeout(() => {
                this.newDeps.delete(key);
                this.canvas_ref
                    ?.querySelector(
                        `path.o_tlg_dep_arrow.o_tlg_new[data-predecessor-id="${predecessorId}"][data-successor-id="${successorId}"]`
                    )
                    ?.classList.remove("o_tlg_new");
            }, NEW_HIGHLIGHT_MS);
        }
        this.draw_canvas();
    },

    /**
     * Called by the layout module at the end of each draw_dependencies pass.
     */
    _ganttDrawPendingDeps() {
        const items = this.timeline?.itemSet?.items;
        if (!items) {
            return;
        }
        for (const {predecessorId, successorId} of this.pendingDeps.values()) {
            const from = items[predecessorId];
            const to = items[successorId];
            const fromEl = from?.dom?.box || from?.dom?.point;
            const toEl = to?.dom?.box || to?.dom?.point;
            if (!fromEl?.isConnected || !toEl?.isConnected) {
                continue;
            }
            this.canvas.drawDependencyCurve(fromEl, toEl, {
                predecessorId,
                successorId,
                pending: true,
            });
        }
        for (const key of this.newDeps) {
            const [predecessorId, successorId] = key.split("->");
            this.canvas_ref
                ?.querySelector(
                    `path.o_tlg_dep_arrow[data-predecessor-id="${predecessorId}"][data-successor-id="${successorId}"]`
                )
                ?.classList.add("o_tlg_new");
        }
    },
});

TimelineRenderer.props = {
    ...TimelineRenderer.props,
    // Optional: stock timeline views without the patched controller chain
    // must stay valid under OWL dev-mode prop validation.
    onCreateDependency: {type: Function, optional: true},
    onRemoveDependency: {type: Function, optional: true},
};
