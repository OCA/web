/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {bezierPathD} from "@web_timeline_gantt_ux/core/bezier.esm";

describe("web_timeline_gantt_ux bezier", () => {
    test("forward link is a single horizontal-tangent cubic", () => {
        const d = bezierPathD(100, 50, 300, 120, 36);
        expect(d.startsWith("M100,50 ")).toBe(true);
        expect(d.endsWith("300,120")).toBe(true);
        // Exactly one cubic segment.
        expect(d.split("C").length).toBe(2);
        // Offset clamped to MAX (60) for a 200px gap.
        expect(d).toInclude("C160,50");
        expect(d).toInclude("240,120");
    });

    test("backward link takes the S-route through the mid line", () => {
        const d = bezierPathD(300, 50, 100, 120, 36);
        // Two cubic segments out-right and back-left.
        expect(d.split("C").length).toBe(3);
        // Mid Y between rows.
        expect(d).toInclude(",85 ");
    });

    test("same-row backward link detours one row height below", () => {
        const d = bezierPathD(300, 50, 290, 50, 36);
        expect(d.split("C").length).toBe(3);
        // MidY = y1 + rowHeight.
        expect(d).toInclude(",86 ");
    });
});
