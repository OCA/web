/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {buildGanttGroups} from "@web_timeline_gantt_ux/gantt_layout/renderer_layout_patch.esm";

const RECORDS = [
    {id: 1, display_name: "Alpha", project_id: [10, "P10"], date_start: "2026-07-01"},
    {id: 2, display_name: "Beta", project_id: [10, "P10"], date_start: false},
    {id: 3, display_name: "Gamma", project_id: [20, "P20"], date_start: "2026-07-02"},
    {id: 4, display_name: "Delta", project_id: false, date_start: "2026-07-03"},
];

describe("web_timeline_gantt_ux group building", () => {
    test("one parent per group-by value, one namespaced row per record", () => {
        const groups = buildGanttGroups(RECORDS, "project_id", new Set(), "date_start");
        const parents = groups.filter((g) => g.nestedGroups);
        const rows = groups.filter((g) => !g.nestedGroups);
        expect(parents.map((g) => g.id)).toEqual([
            "grp_10",
            "grp_20",
            "grp_unassigned",
        ]);
        expect(rows.map((g) => g.id)).toEqual(["rec_1", "rec_2", "rec_3", "rec_4"]);
        // Every row is level 1 (vis red-borders unknown levels) and belongs
        // to its parent's nestedGroups.
        expect(rows.every((g) => g.treeLevel === 1)).toBe(true);
        expect(parents[0].nestedGroups).toEqual(["rec_1", "rec_2"]);
        expect(parents[2].nestedGroups).toEqual(["rec_4"]);
    });

    test("parent bands carry name and task count; unassigned sorts first", () => {
        const groups = buildGanttGroups(RECORDS, "project_id", new Set(), "date_start");
        const parents = groups.filter((g) => g.nestedGroups);
        expect(parents[0].content).toInclude("P10");
        expect(parents[0].content).toInclude("(2)");
        const unassigned = parents.find((g) => g.id === "grp_unassigned");
        expect(unassigned.order).toBe(-1);
    });

    test("collapse state is applied via showNested", () => {
        const groups = buildGanttGroups(
            RECORDS,
            "project_id",
            new Set(["grp_10"]),
            "date_start"
        );
        const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
        expect(byId.grp_10.showNested).toBe(false);
        expect(byId.grp_20.showNested).toBe(true);
    });

    test("row order is stable regardless of fetch order", () => {
        // The search_read is ordered by the group-by field only; in-parent
        // tie order from the database is arbitrary and MUST not leak into
        // row order (rows would shuffle on every reload).
        // In-parent tie order flipped (rec_2 before rec_1).
        const shuffled = [RECORDS[1], RECORDS[0], RECORDS[2], RECORDS[3]];
        const a = buildGanttGroups(RECORDS, "project_id", new Set(), "date_start");
        const b = buildGanttGroups(shuffled, "project_id", new Set(), "date_start");
        for (const parentA of a.filter((g) => g.nestedGroups)) {
            const parentB = b.find((g) => g.id === parentA.id);
            expect(parentB.nestedGroups).toEqual(parentA.nestedGroups);
        }
        // Vis places rows by their order property: relative order within a
        // parent must match the stable ordering, not the fetch order.
        const rowOrder = (groups, id) => groups.find((g) => g.id === id).order;
        expect(rowOrder(b, "rec_1") < rowOrder(b, "rec_2")).toBe(true);
    });

    test("task rows are blank alignment tracks; the name rides on the bar", () => {
        const groups = buildGanttGroups(RECORDS, "project_id", new Set(), "date_start");
        const rows = groups.filter((g) => !g.nestedGroups);
        expect(rows.every((g) => g.content === "")).toBe(true);
        expect(rows[0].title).toBe("Alpha");
    });

    test("unscheduled records get the marker class", () => {
        const groups = buildGanttGroups(RECORDS, "project_id", new Set(), "date_start");
        const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
        expect(byId.rec_2.className).toInclude("o_tlg_unscheduled");
        expect(byId.rec_1.className).not.toInclude("o_tlg_unscheduled");
    });

    test("m2m group-by uses the first value with a placeholder label", () => {
        const records = [
            {id: 5, display_name: "Eps", tag_ids: [7, 8], date_start: "2026-07-01"},
        ];
        const groups = buildGanttGroups(records, "tag_ids", new Set(), "date_start");
        const parent = groups.find((g) => g.nestedGroups);
        expect(parent.id).toBe("grp_7");
        expect(parent.content).toInclude("#7");
    });
});
