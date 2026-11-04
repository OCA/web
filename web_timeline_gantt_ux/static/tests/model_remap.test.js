/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {TimelineModel} from "@web_timeline/views/timeline/timeline_model.esm";
import {ganttItemStyle} from "@web_timeline_gantt_ux/gantt_layout/model_patch.esm";

const {DateTime} = luxon;

function makeModel(ganttUx) {
    // Bare receiver for the prototype method: stubs everything the stock
    // _event_data_transform touches.
    return {
        params: {gantt_ux: ganttUx},
        last_group_bys: ["project_id"],
        colors: [],
        recordTemplate: null,
        _get_event_dates: () => [DateTime.now(), null],
    };
}

describe("web_timeline_gantt_ux model remap", () => {
    test("gantt mode namespaces the item group, ids stay raw", () => {
        const model = makeModel(true);
        const item = TimelineModel.prototype._event_data_transform.call(model, {
            id: 42,
            display_name: "Task",
            project_id: [10, "P10"],
        });
        expect(item.group).toBe("rec_42");
        expect(item.id).toBe(42);
    });

    test("stock mode keeps the group-by value", () => {
        const model = makeModel(false);
        const item = TimelineModel.prototype._event_data_transform.call(model, {
            id: 42,
            display_name: "Task",
            project_id: [10, "P10"],
        });
        expect(item.group).toBe(10);
    });

    test("ganttItemStyle converts matched colors to a custom property", () => {
        expect(ganttItemStyle("background-color: #a8dbc0;")).toEqual({
            style: "--o-tlg-item-color: #a8dbc0;",
            colored: true,
        });
        expect(ganttItemStyle("background-color: false;")).toEqual({
            style: "",
            colored: false,
        });
        expect(ganttItemStyle("")).toEqual({style: "", colored: false});
    });
});
