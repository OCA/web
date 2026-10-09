// Copyright 2026 OCA
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import {describe, expect, test} from "@odoo/hoot";
import {PivotRenderer} from "@web/views/pivot/pivot_renderer";
import "../../src/js/pivot_renderer.esm.js";

// Minimal fake row factory
function makeRow(title, values, indent = 0) {
    return {
        title,
        indent,
        isLeaf: true,
        isFolded: false,
        groupId: [[title], []],
        subGroupMeasurements: values.map((v) => ({value: v, measure: "count"})),
    };
}

// Minimal fake renderer instance (no OWL mount needed for pure-JS logic tests)
function makeFakeRenderer(rows) {
    const instance = Object.create(PivotRenderer.prototype);
    instance.table = {rows};
    instance._lastTable = instance.table;
    instance.mergeState = {merged: {}}; // Simulate useState
    return instance;
}

describe("web_pivot_merge_rows", () => {
    test("T1 - merge two adjacent rows", () => {
        const rows = [
            makeRow("A", [10, 20]),
            makeRow("B", [5, 15]),
            makeRow("C", [3, 7]),
        ];
        const renderer = makeFakeRenderer(rows);
        renderer.onMergeClick(0);
        const displayed = renderer.getRows();
        expect(displayed).toHaveLength(2);
        expect(displayed[0].isMerged).toBe(true);
        expect(displayed[0].title).toBe("A + B");
        expect(displayed[0].subGroupMeasurements[0].value).toBe(15);
        expect(displayed[0].subGroupMeasurements[1].value).toBe(35);
    });

    test("T2 - unmerge restores original rows", () => {
        const rows = [makeRow("A", [10]), makeRow("B", [5])];
        const renderer = makeFakeRenderer(rows);
        renderer.onMergeClick(0);
        renderer.onUnmergeClick(0);
        const displayed = renderer.getRows();
        expect(displayed).toHaveLength(2);
        expect(displayed[0].isMerged).toBe(false);
    });

    test("T3 - canMergeRow false on last row", () => {
        const rows = [makeRow("A", [1]), makeRow("B", [2])];
        const renderer = makeFakeRenderer(rows);
        const displayed = renderer.getRows();
        expect(renderer.canMergeRow(displayed[1])).toBe(false);
    });

    test("T4 - cross-indent merge is blocked", () => {
        const rows = [makeRow("Parent", [10], 0), makeRow("Child", [5], 1)];
        const renderer = makeFakeRenderer(rows);
        renderer.onMergeClick(0);
        expect(renderer.mergeState.merged).toEqual({});
    });

    test("T5 - model reload resets merge state", () => {
        const rows = [makeRow("A", [1]), makeRow("B", [2])];
        const renderer = makeFakeRenderer(rows);
        renderer.onMergeClick(0);
        // Simulate model reload: new table reference
        renderer.table = {rows: [...rows]};
        renderer.onWillUpdateProps();
        expect(renderer.mergeState.merged).toEqual({});
    });

    test("T6 - chained merge three rows", () => {
        const rows = [makeRow("A", [1]), makeRow("B", [2]), makeRow("C", [3])];
        const renderer = makeFakeRenderer(rows);
        renderer.onMergeClick(0);
        renderer.onMergeClick(0);
        const displayed = renderer.getRows();
        expect(displayed).toHaveLength(1);
        expect(displayed[0].title).toBe("A + B + C");
        expect(displayed[0].subGroupMeasurements[0].value).toBe(6);
    });

    test("T7 - undefined measure stays undefined", () => {
        const rows = [makeRow("A", [10, undefined]), makeRow("B", [5, 3])];
        const renderer = makeFakeRenderer(rows);
        renderer.onMergeClick(0);
        const displayed = renderer.getRows();
        expect(displayed[0].subGroupMeasurements[0].value).toBe(15);
        expect(displayed[0].subGroupMeasurements[1].value).toBeUndefined();
    });
});
