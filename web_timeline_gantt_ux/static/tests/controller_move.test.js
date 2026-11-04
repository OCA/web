/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {TimelineController} from "@web_timeline/views/timeline/timeline_controller.esm";

// CRITICAL regression guard for the moveQueue coupling: the gantt patch
// deletes the group-by field from the entry the STOCK _onMove just pushed to
// this.moveQueue (a private structure). If an OCA web_timeline bump reshapes
// that queue, this test fails loudly instead of every bar drag failing with
// e.g. `project_id: "rec_42"` server errors in production.

function makeController(ganttUx) {
    return {
        date_start: "planned_date_start",
        date_stop: "planned_date_end",
        date_delay: null,
        model: {
            serializeDate: (field, dt) => dt.toISO(),
            fields: {project_id: {type: "many2one"}},
            last_group_bys: ["project_id"],
        },
        moveQueue: [],
        debouncedInternalMove: () => {
            return;
        },
        props: {modelParams: {gantt_ux: ganttUx}},
    };
}

describe("web_timeline_gantt_ux controller move", () => {
    test("gantt mode strips the group-by field from the queued move", () => {
        const controller = makeController(true);
        TimelineController.prototype._onMove.call(
            controller,
            {
                id: 42,
                start: new Date(2026, 6, 1),
                end: new Date(2026, 6, 3),
                group: "rec_42",
            },
            () => {
                return;
            }
        );
        expect(controller.moveQueue.length).toBe(1);
        const queued = controller.moveQueue[0];
        expect(queued.id).toBe(42);
        expect("project_id" in queued.data).toBe(false);
        expect("planned_date_start" in queued.data).toBe(true);
        expect("planned_date_end" in queued.data).toBe(true);
    });

    test("stock mode still writes the group-by field", () => {
        const controller = makeController(false);
        TimelineController.prototype._onMove.call(
            controller,
            {
                id: 42,
                start: new Date(2026, 6, 1),
                end: new Date(2026, 6, 3),
                group: 10,
            },
            () => {
                return;
            }
        );
        expect(controller.moveQueue.length).toBe(1);
        expect(controller.moveQueue[0].data.project_id).toBe(10);
    });
});
