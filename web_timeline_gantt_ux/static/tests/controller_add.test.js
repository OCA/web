/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {remapAddGroup} from "@web_timeline_gantt_ux/gantt_layout/controller_layout_patch.esm";

const RECORDS = [
    {id: 42, project_id: [10, "P10"]},
    {id: 43, project_id: false},
];

describe("web_timeline_gantt_ux controller add remap", () => {
    test("parent band id resolves to the group-by value id", () => {
        expect(remapAddGroup("grp_10", RECORDS, "project_id")).toBe(10);
    });

    test("task row id resolves through the record's group-by value", () => {
        expect(remapAddGroup("rec_42", RECORDS, "project_id")).toBe(10);
        expect(remapAddGroup("rec_43", RECORDS, "project_id")).toBe(-1);
        expect(remapAddGroup("rec_999", RECORDS, "project_id")).toBe(-1);
    });

    test("unassigned and unknown ids resolve to -1", () => {
        expect(remapAddGroup("grp_unassigned", RECORDS, "project_id")).toBe(-1);
        expect(remapAddGroup("weird", RECORDS, "project_id")).toBe(-1);
    });
});
