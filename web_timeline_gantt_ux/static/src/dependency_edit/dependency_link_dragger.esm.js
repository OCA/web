/** @odoo-module **/

import {_t} from "@web/core/l10n/translation";
import {bezierPathD} from "@web_timeline_gantt_ux/core/bezier.esm";

const SVG_NS = "http://www.w3.org/2000/svg";
// The handle is a 28px hit zone (14px visual disc centered via CSS). On
// UNSELECTED bars it overlaps the pill's right edge by 2px so the pointer
// path bar -> handle never crosses dead space. On SELECTED bars — the only
// state where vis renders resize handles — it instead sits fully OUTSIDE
// vis's .vis-drag-right zone (which extends 4px past the edge and shrinks
// to cover the whole right end of short pills); any overlap there would
// steal the entire resize affordance of a 1-2 day bar.
const HANDLE_SIZE = 28;
const HANDLE_OVERLAP = 2;
const RESIZE_CLEARANCE = 4;
// Grace period before hiding: crossing an arrow's 10px hit corridor (every
// task with an outgoing dependency has one at its right edge) fires itemout
// mid-travel; an instant hide would make the handle ungrabbable there.
const HIDE_GRACE_MS = 250;

/**
 * Client-side link validation from already-loaded data. Pure and exported
 * for DOM-free tests. Returns a user-facing message, or null when the link
 * is allowed. Cycles beyond these direct checks are rejected server-side
 * (project.task._check_no_cyclic_dependencies).
 *
 * @param {Object} args
 * @param {Number} args.predecessorId
 * @param {Number} args.successorId
 * @param {Function} args.getRecord id -> loaded record (or undefined)
 * @param {String} args.depField m2m "blocked by" field name
 * @param {Function} [args.canLink] record -> Boolean (feature gating)
 * @param {Function} [args.isPending] (predecessorId, successorId) -> Boolean
 * @returns {String|null}
 */
export function validateLink({
    predecessorId,
    successorId,
    getRecord,
    depField,
    canLink,
    isPending,
}) {
    if (predecessorId === successorId) {
        return _t("A task cannot depend on itself.");
    }
    const successor = getRecord(successorId);
    const predecessor = getRecord(predecessorId);
    if (!successor || !predecessor) {
        return _t("Unknown task.");
    }
    if (canLink && (!canLink(predecessor) || !canLink(successor))) {
        return _t("Task dependencies are disabled for this project.");
    }
    if (isPending && isPending(predecessorId, successorId)) {
        return _t("This dependency is already being saved.");
    }
    const successorDeps = successor[depField] || [];
    if (successorDeps.includes(predecessorId)) {
        return _t(
            '"%s" is already blocked by "%s".',
            successor.display_name,
            predecessor.display_name
        );
    }
    const predecessorDeps = predecessor[depField] || [];
    if (predecessorDeps.includes(successorId)) {
        return _t(
            '"%s" is already blocked by "%s" — the reverse link would conflict.',
            predecessor.display_name,
            successor.display_name
        );
    }
    return null;
}

/**
 * Framework-free drag state machine for creating dependencies.
 *
 * A hover-born handle lives in an overlay OUTSIDE the vis item DOM, so vis's
 * Hammer instances (which only see events bubbling from the pointerdown
 * target) never observe the gesture: no pan, no item drag, no select. The
 * collision rule is selection-aware (see the geometry constants): on
 * selected bars the link zone starts past vis's resize zone so resize stays
 * fully grabbable even on 1-day pills; on unselected bars (no resize
 * handles) the link zone overlaps the pill edge by 2px for gap-free travel.
 *
 * States: IDLE -> HANDLE_SHOWN -> DRAGGING -> IDLE.
 */
export class DependencyLinkDragger {
    /**
     * @param {Object} deps
     * @param {Object} deps.timeline vis.Timeline instance
     * @param {SVGElement} deps.canvasSvg arrow overlay SVG (cleared on redraws)
     * @param {HTMLElement} deps.overlayEl handle overlay div
     * @param {HTMLElement} deps.rootEl view root (gets o_tlg_linking)
     * @param {String} deps.depField
     * @param {Function} deps.getRecord id -> loaded record
     * @param {Function} deps.canLink record -> Boolean
     * @param {Function} deps.isPending (predId, succId) -> Boolean
     * @param {Function} deps.onCreateDependency ({predecessorId, successorId})
     * @param {Function} deps.notify (message, type)
     */
    constructor(deps) {
        Object.assign(this, deps);
        this.state = "IDLE";
        this.hoverId = null;
        this.sourceId = null;
        this.candidate = null;
        this.ghostEl = null;
        this.handleEl = document.createElement("div");
        this.handleEl.className = "o_tlg_handle";
        this.handleEl.style.display = "none";
        this.handleEl.title = _t("Drag to another task to create a dependency");
        this.handleEl.setAttribute("role", "button");
        this.handleEl.setAttribute(
            "aria-label",
            _t("Create a dependency from this task")
        );
        this.handleEl.addEventListener("pointerdown", (ev) =>
            this._onHandlePointerDown(ev)
        );
        this.handleEl.addEventListener("pointerenter", () => this._cancelHide());
        this.handleEl.addEventListener("pointerleave", () => {
            if (this.state === "HANDLE_SHOWN") {
                this._scheduleHide();
            }
        });
        this.overlayEl.appendChild(this.handleEl);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onPointerCancel = () => this._cancel();
        this._onKeyDown = (ev) => {
            if (ev.key === "Escape") {
                ev.stopPropagation();
                this._cancel();
            }
        };
        this._onWindowBlur = () => this._cancel();
        this._rafPending = false;
        this._lastPointerEvent = null;
        this._hideTimer = null;
    }

    destroy() {
        this._cancel();
        this.handleEl.remove();
    }

    // ------------------------------------------------------------------
    // Hover handle
    // ------------------------------------------------------------------

    onItemOver(id) {
        if (this.state === "DRAGGING") {
            return;
        }
        this._cancelHide();
        const item = this.timeline.itemSet?.items?.[id];
        const record = Number.isInteger(id) ? this.getRecord(id) : null;
        if (
            !item ||
            !record ||
            !item.displayed ||
            !item.dom?.box?.isConnected ||
            !this.canLink(record)
        ) {
            this._hideHandle();
            return;
        }
        this.hoverId = id;
        this.state = "HANDLE_SHOWN";
        this._positionHandle(item);
    }

    onItemOut() {
        if (this.state !== "HANDLE_SHOWN") {
            return;
        }
        // Moving from the bar onto the handle fires itemout; the handle's
        // own pointerenter cancels the deferred hide.
        if (!this.handleEl.matches(":hover")) {
            this._scheduleHide();
        }
    }

    _scheduleHide() {
        this._cancelHide();
        this._hideTimer = window.setTimeout(() => {
            this._hideTimer = null;
            this._hideHandle();
        }, HIDE_GRACE_MS);
    }

    _cancelHide() {
        if (this._hideTimer !== null) {
            window.clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
    }

    onTimelineChanged() {
        if (this.state === "HANDLE_SHOWN") {
            const item = this.timeline.itemSet?.items?.[this.hoverId];
            if (item?.displayed && item.dom?.box?.isConnected) {
                this._positionHandle(item);
            } else {
                this._hideHandle();
            }
        } else if (this.state === "DRAGGING") {
            // The canvas is wiped on every redraw: re-attach the ghost and
            // recompute it against the (possibly moved) source bar.
            if (this.ghostEl && !this.ghostEl.isConnected) {
                this.canvasSvg.appendChild(this.ghostEl);
            }
            if (this._lastPointerEvent) {
                this._updateDrag(this._lastPointerEvent);
            }
        }
    }

    _positionHandle(item) {
        const box = item.dom.box;
        const centerRect = this.timeline.dom.centerContainer.getBoundingClientRect();
        const rect = box.getBoundingClientRect();
        // Selection-aware collision rule: see the constants above. Selection
        // changes redraw the timeline, so onTimelineChanged repositions the
        // handle with the current state.
        const offset = item.selected ? RESIZE_CLEARANCE : -HANDLE_OVERLAP;
        this.handleEl.style.display = "";
        this.handleEl.style.left = `${rect.right - centerRect.left + offset}px`;
        this.handleEl.style.top = `${
            rect.top - centerRect.top + rect.height / 2 - HANDLE_SIZE / 2
        }px`;
    }

    _hideHandle() {
        if (this.state === "DRAGGING") {
            // A stale grace timer must never remove the pointer-captured
            // element mid-drag.
            return;
        }
        this._cancelHide();
        this.handleEl.style.display = "none";
        this.hoverId = null;
        if (this.state === "HANDLE_SHOWN") {
            this.state = "IDLE";
        }
    }

    // ------------------------------------------------------------------
    // Drag
    // ------------------------------------------------------------------

    _onHandlePointerDown(ev) {
        if (ev.button !== 0 || this.state !== "HANDLE_SHOWN") {
            return;
        }
        // Suppress text selection and hide the gesture from vis's Hammer
        // instances (they only see events bubbling from the target).
        ev.preventDefault();
        ev.stopPropagation();
        this._cancelHide();
        this.handleEl.setPointerCapture(ev.pointerId);
        this.state = "DRAGGING";
        this.sourceId = this.hoverId;
        this.candidate = null;
        this.rootEl.classList.add("o_tlg_linking");
        this.ghostEl = document.createElementNS(SVG_NS, "path");
        this.ghostEl.setAttribute("class", "o_tlg_ghost");
        this.ghostEl.setAttribute("fill", "none");
        this.canvasSvg.appendChild(this.ghostEl);
        // Pointer capture routes move/up to the handle regardless of what
        // is under the cursor.
        this.handleEl.addEventListener("pointermove", this._onPointerMove);
        this.handleEl.addEventListener("pointerup", this._onPointerUp);
        this.handleEl.addEventListener("pointercancel", this._onPointerCancel);
        document.addEventListener("keydown", this._onKeyDown, {capture: true});
        window.addEventListener("blur", this._onWindowBlur);
    }

    _onPointerMove(ev) {
        this._lastPointerEvent = ev;
        if (this._rafPending) {
            return;
        }
        this._rafPending = true;
        window.requestAnimationFrame(() => {
            this._rafPending = false;
            if (this.state === "DRAGGING" && this._lastPointerEvent) {
                this._updateDrag(this._lastPointerEvent);
            }
        });
    }

    _updateDrag(ev) {
        const source = this.timeline.itemSet?.items?.[this.sourceId];
        const sourceEl = source?.dom?.box;
        if (!source?.displayed || !sourceEl?.isConnected) {
            this._cancel();
            return;
        }
        const centerRect = this.timeline.dom.centerContainer.getBoundingClientRect();
        const sourceRect = sourceEl.getBoundingClientRect();
        const d = bezierPathD(
            sourceRect.right - centerRect.left,
            sourceRect.top - centerRect.top + sourceRect.height / 2,
            ev.clientX - centerRect.left,
            ev.clientY - centerRect.top,
            36
        );
        this.ghostEl?.setAttribute("d", d);
        // Hit-test the drop candidate. The handle and existing arrows are
        // pointer-events: none while linking, so they stay transparent here.
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        let visItem = null;
        try {
            visItem = el && this.timeline.itemSet.itemFromElement(el);
        } catch {
            visItem = null;
        }
        const id = visItem?.id;
        if (
            !Number.isInteger(id) ||
            id === this.sourceId ||
            !visItem.dom?.box?.isConnected
        ) {
            this._setCandidate(null);
            return;
        }
        const error = validateLink({
            predecessorId: this.sourceId,
            successorId: id,
            getRecord: this.getRecord,
            depField: this.depField,
            canLink: this.canLink,
            isPending: this.isPending,
        });
        this._setCandidate({id, error, el: visItem.dom.box});
    }

    _setCandidate(candidate) {
        if (this.candidate?.el && this.candidate.el !== candidate?.el) {
            this.candidate.el.classList.remove("o_tlg_drop_ok", "o_tlg_drop_invalid");
        }
        this.candidate = candidate;
        if (candidate?.el) {
            candidate.el.classList.toggle("o_tlg_drop_ok", !candidate.error);
            candidate.el.classList.toggle(
                "o_tlg_drop_invalid",
                Boolean(candidate.error)
            );
        }
    }

    _onPointerUp() {
        const candidate = this.candidate;
        const sourceId = this.sourceId;
        this._cleanup();
        if (!candidate) {
            return;
        }
        if (candidate.error) {
            this.notify(candidate.error, "warning");
            return;
        }
        this.onCreateDependency({
            predecessorId: sourceId,
            successorId: candidate.id,
        });
    }

    _cancel() {
        if (this.state === "DRAGGING") {
            this._cleanup();
        }
    }

    _cleanup() {
        this.handleEl.removeEventListener("pointermove", this._onPointerMove);
        this.handleEl.removeEventListener("pointerup", this._onPointerUp);
        this.handleEl.removeEventListener("pointercancel", this._onPointerCancel);
        document.removeEventListener("keydown", this._onKeyDown, {capture: true});
        window.removeEventListener("blur", this._onWindowBlur);
        this._setCandidate(null);
        this.ghostEl?.remove();
        this.ghostEl = null;
        this._lastPointerEvent = null;
        this.rootEl.classList.remove("o_tlg_linking");
        this.state = "IDLE";
        this.sourceId = null;
        this._hideHandle();
    }
}
