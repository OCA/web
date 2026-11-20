/** @odoo-module **/

const MIN_OFFSET = 16;
const MAX_OFFSET = 60;

/**
 * Cubic Bézier path between a predecessor's right edge and a successor's left
 * edge, in the same coordinate space (the .vis-center panel).
 *
 * Two regimes:
 * - Forward link (successor starts comfortably after the predecessor ends):
 *   a single cubic with horizontal tangents.
 * - Backward/tight link (successor starts at or before the predecessor's
 *   end): an S-route out to the right, through a mid line, back to the left.
 *   When both anchors sit on the same row, the mid line detours one row
 *   below so the curve does not run through the bar itself.
 *
 * @param {Number} x1 predecessor right edge x
 * @param {Number} y1 predecessor vertical center y
 * @param {Number} x2 successor left edge x
 * @param {Number} y2 successor vertical center y
 * @param {Number} rowHeight row rhythm used for the same-row detour
 * @returns {String} SVG path "d" attribute
 */
export function bezierPathD(x1, y1, x2, y2, rowHeight = 36) {
    const dx = x2 - x1;
    if (dx >= 2 * MIN_OFFSET) {
        const off = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, dx / 2));
        return `M${x1},${y1} C${x1 + off},${y1} ${x2 - off},${y2} ${x2},${y2}`;
    }
    const off = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, Math.abs(dx)));
    const sameRow = Math.abs(y2 - y1) < rowHeight;
    const midY = sameRow ? y1 + rowHeight : (y1 + y2) / 2;
    const midX = (x1 + x2) / 2;
    return (
        `M${x1},${y1} ` +
        `C${x1 + off},${y1} ${x1 + off},${midY} ${midX},${midY} ` +
        `C${x2 - off},${midY} ${x2 - off},${y2} ${x2},${y2}`
    );
}
