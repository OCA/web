/** @odoo-module **/

import {TimelineCanvas} from "@web_timeline/views/timeline/timeline_canvas.esm";
import {_t} from "@web/core/l10n/translation";
import {bezierPathD} from "@web_timeline_gantt_ux/core/bezier.esm";
import {patch} from "@web/core/utils/patch";

const SVG_NS = "http://www.w3.org/2000/svg";
const ROW_HEIGHT = 36;

patch(TimelineCanvas.prototype, {
    /**
     * Bounding box of an element relative to the .vis-center panel (the
     * same coordinate space the stock draw_line uses).
     *
     * @param {HTMLElement} el
     * @returns {{x: Number, y: Number, w: Number, h: Number}}
     */
    _tlgRelRect(el) {
        const pos = el.getBoundingClientRect();
        const parent = el.closest(".vis-center")?.getBoundingClientRect();
        return {
            x: pos.left - (parent?.left || 0),
            y: pos.top - (parent?.top || 0),
            w: pos.width,
            h: pos.height,
        };
    },

    /**
     * Draw one dependency as a smooth Bézier curve from the predecessor's
     * right edge to the successor's left edge. Two stacked paths per arrow:
     * a transparent 10px hit corridor first (interaction/a11y target), the
     * visible curve second (so `.o_tlg_dep_hit:hover + .o_tlg_dep_arrow`
     * works with pure CSS). Both are wiped by clear() on every redraw —
     * callers must not hold element references.
     *
     * @param {HTMLElement} fromEl predecessor .vis-item box
     * @param {HTMLElement} toEl successor .vis-item box
     * @param {Object} options
     * @param {Number} options.predecessorId
     * @param {Number} options.successorId
     * @param {String} [options.label] canonical a11y/tooltip sentence
     * @param {Boolean} [options.interactive] add the hit corridor + a11y
     * @param {Boolean} [options.pending] render as in-flight (dashed)
     * @returns {SVGPathElement} the visible path
     */
    drawDependencyCurve(fromEl, toEl, options) {
        const {predecessorId, successorId, label, interactive, pending} = options;
        const from = this._tlgRelRect(fromEl);
        const to = this._tlgRelRect(toEl);
        const d = bezierPathD(
            from.x + from.w,
            from.y + from.h / 2,
            to.x,
            to.y + to.h / 2,
            ROW_HEIGHT
        );
        if (interactive && !pending) {
            const hit = document.createElementNS(SVG_NS, "path");
            hit.setAttribute("d", d);
            hit.setAttribute("class", "o_tlg_dep_hit");
            hit.setAttribute("stroke", "transparent");
            hit.setAttribute("stroke-width", "10");
            hit.setAttribute("fill", "none");
            hit.setAttribute("tabindex", "0");
            hit.setAttribute("role", "button");
            if (label) {
                hit.setAttribute(
                    "aria-label",
                    `${label}. ${_t("Press Delete to remove.")}`
                );
                const title = document.createElementNS(SVG_NS, "title");
                title.textContent = `${label} — ${_t("click to remove")}`;
                hit.appendChild(title);
            }
            hit.dataset.predecessorId = predecessorId;
            hit.dataset.successorId = successorId;
            this.canvas_ref.appendChild(hit);
        }
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("class", `o_tlg_dep_arrow${pending ? " o_tlg_pending" : ""}`);
        path.setAttribute("fill", "none");
        path.setAttribute("marker-end", "url(#o_tlg_arrowhead)");
        path.dataset.predecessorId = predecessorId;
        path.dataset.successorId = successorId;
        this.canvas_ref.appendChild(path);
        return path;
    },
});
