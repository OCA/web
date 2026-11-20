/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {
    applyGanttOptions,
    snapToDay,
} from "@web_timeline_gantt_ux/core/arch_parser_patch.esm";
import {TimelineArchParser} from "@web_timeline/views/timeline/timeline_arch_parser.esm";

const FIELDS = {
    display_name: {type: "char"},
    date_start: {type: "datetime"},
    project_id: {type: "many2one"},
};

function parseArch(archString) {
    const arch = new DOMParser().parseFromString(
        archString,
        "text/xml"
    ).documentElement;
    return new TimelineArchParser().parse(arch, FIELDS);
}

describe("web_timeline_gantt_ux arch parser", () => {
    test("gantt_ux attribute enables the option overrides", () => {
        const archInfo = parseArch(
            `<timeline date_start="date_start" default_group_by="project_id" gantt_ux="true"/>`
        );
        expect(archInfo.gantt_ux).toBe(true);
        expect(archInfo.options.stack).toBe(false);
        expect(archInfo.options.orientation.axis).toBe("top");
        expect(archInfo.options.dataAttributes).toEqual(["id"]);
        expect(archInfo.options.zoomMin).toBe(3 * 24 * 60 * 60 * 1000);
        expect(typeof archInfo.options.snap).toBe("function");
        // The initial window is renderer-owned, never an option.
        expect(archInfo.options.start).toBe(undefined);
        expect(archInfo.options.end).toBe(undefined);
    });

    test("without gantt_ux the archInfo stays stock", () => {
        const archInfo = parseArch(
            `<timeline date_start="date_start" default_group_by="project_id"/>`
        );
        expect(archInfo.gantt_ux).toBe(false);
        expect(archInfo.options.stack).toBe(true);
        expect(archInfo.options.orientation.axis).toBe("both");
        expect(archInfo.options.snap).toBe(undefined);
    });

    test("explicit arch attributes win over gantt defaults", () => {
        const node = new DOMParser().parseFromString(
            `<timeline date_start="date_start" default_group_by="project_id" stack="true"/>`,
            "text/xml"
        ).documentElement;
        const archInfo = {options: {stack: true, margin: {item: 2}}};
        applyGanttOptions(archInfo, node);
        expect(archInfo.options.stack).toBe(true);
        // Margin not set in the arch: gantt default applies.
        expect(archInfo.options.margin).toEqual({item: 6, axis: 8});
    });

    test("snapToDay rounds to the nearest local midnight", () => {
        const morning = new Date(2026, 6, 28, 11, 59);
        const afternoon = new Date(2026, 6, 28, 12, 1);
        expect(snapToDay(morning).getDate()).toBe(28);
        expect(snapToDay(morning).getHours()).toBe(0);
        expect(snapToDay(afternoon).getDate()).toBe(29);
        expect(snapToDay(afternoon).getHours()).toBe(0);
    });
});
