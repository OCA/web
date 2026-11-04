/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {
    classifyMove,
    collectDependentShifts,
} from "@web_timeline_gantt_ux/dependency_edit/move_cascade.esm";
import {TimelineController} from "@web_timeline/views/timeline/timeline_controller.esm";

const {DateTime} = luxon;
const DAY_MS = 24 * 60 * 60 * 1000;

describe("web_timeline_gantt_ux move classification", () => {
    const d = (iso) => new Date(iso);

    test("center drag (duration preserved) is a time move with its delta", () => {
        const {timeMove, deltaMs} = classifyMove({
            oldStart: d("2026-07-01T08:00:00Z"),
            oldEnd: d("2026-07-03T08:00:00Z"),
            newStart: d("2026-07-03T08:00:00Z"),
            newEnd: d("2026-07-05T08:00:00Z"),
        });
        expect(timeMove).toBe(true);
        expect(deltaMs).toBe(2 * DAY_MS);
    });

    test("edge resize (duration changed) is not a time move", () => {
        expect(
            classifyMove({
                oldStart: d("2026-07-01T08:00:00Z"),
                oldEnd: d("2026-07-03T08:00:00Z"),
                newStart: d("2026-07-01T08:00:00Z"),
                newEnd: d("2026-07-04T08:00:00Z"),
            }).timeMove
        ).toBe(false);
    });

    test("zero delta and missing bounds are not time moves", () => {
        const same = d("2026-07-01T08:00:00Z");
        expect(
            classifyMove({oldStart: same, oldEnd: null, newStart: same, newEnd: null})
                .timeMove
        ).toBe(false);
        expect(
            classifyMove({oldStart: null, oldEnd: null, newStart: same, newEnd: null})
                .timeMove
        ).toBe(false);
    });
});

describe("web_timeline_gantt_ux dependent shifts", () => {
    // B blocked by A; C blocked by B (chain). D independent. E blocked by A
    // but unscheduled; F blocked by E (must still shift, through E).
    const RECORDS = [
        {id: 1, display_name: "A", depend_on_ids: [], date_start: "2026-07-01"},
        {id: 2, display_name: "B", depend_on_ids: [1], date_start: "2026-07-05"},
        {id: 3, display_name: "C", depend_on_ids: [2], date_start: "2026-07-09"},
        {id: 4, display_name: "D", depend_on_ids: [], date_start: "2026-07-01"},
        {id: 5, display_name: "E", depend_on_ids: [1], date_start: false},
        {id: 6, display_name: "F", depend_on_ids: [5], date_start: "2026-07-11"},
    ];

    test("transitive downstream closure with per-root delta", () => {
        const shifts = collectDependentShifts(RECORDS, "depend_on_ids", "date_start", [
            {id: 1, deltaMs: DAY_MS},
        ]);
        expect([...shifts.keys()].sort()).toEqual([2, 3, 6]);
        expect(shifts.get(2)).toBe(DAY_MS);
        expect(shifts.get(3)).toBe(DAY_MS);
    });

    test("unscheduled dependents are traversed but not shifted", () => {
        const shifts = collectDependentShifts(RECORDS, "depend_on_ids", "date_start", [
            {id: 1, deltaMs: DAY_MS},
        ]);
        expect(shifts.has(5)).toBe(false);
        expect(shifts.get(6)).toBe(DAY_MS);
    });

    test("moved records never appear in the result; cycles terminate", () => {
        const cyclic = [
            {id: 1, depend_on_ids: [2], date_start: "2026-07-01"},
            {id: 2, depend_on_ids: [1], date_start: "2026-07-02"},
        ];
        const shifts = collectDependentShifts(cyclic, "depend_on_ids", "date_start", [
            {id: 1, deltaMs: DAY_MS},
        ]);
        expect(shifts.has(1)).toBe(false);
        expect([...shifts.keys()]).toEqual([2]);
    });

    test("no dependents means no prompt candidates", () => {
        const shifts = collectDependentShifts(RECORDS, "depend_on_ids", "date_start", [
            {id: 4, deltaMs: DAY_MS},
        ]);
        expect(shifts.size).toBe(0);
    });
});

describe("web_timeline_gantt_ux cascade drain", () => {
    // Fake controller exercising the patched internalMove end to end with a
    // scripted dialog choice. Mirrors the moveQueue coupling guard in
    // controller_move.test.js.
    function makeController({choice, records}) {
        const writes = [];
        const callbacks = [];
        let loads = 0;
        let renders = 0;
        let prompted = 0;
        const fields = {
            planned_date_start: {type: "datetime"},
            planned_date_end: {type: "datetime"},
        };
        const controller = {
            date_start: "planned_date_start",
            date_stop: "planned_date_end",
            props: {modelParams: {gantt_ux: true}},
            model: {
                params: {dependency_arrow: "depend_on_ids"},
                data: records,
                fields,
                parseDate: (field, value) => DateTime.fromISO(value, {zone: "utc"}),
                serializeDate: (field, dt) => dt.toISO(),
                write_completed: (id, vals) => {
                    writes.push({id, vals});
                    return Promise.resolve();
                },
                load: () => {
                    loads++;
                    return Promise.resolve();
                },
            },
            getSearchProps: () => ({}),
            render: () => {
                renders++;
            },
            dialogService: {
                add: (component, props) => {
                    prompted++;
                    props.onChoice(choice);
                },
            },
            tlgNotification: {
                add: () => {
                    return;
                },
            },
            moveQueue: [],
        };
        controller.spy = {
            writes,
            callbacks,
            counters: () => ({loads, renders, prompted}),
        };
        // The drain calls sibling prototype methods (_tlgGanttInternalMove,
        // _tlgCascadeBody, _tlgShiftedDates); a plain object fake cannot
        // reach them without the prototype chain.
        Object.setPrototypeOf(controller, TimelineController.prototype);
        return controller;
    }

    const RECORDS = [
        {
            id: 1,
            display_name: "A",
            depend_on_ids: [],
            planned_date_start: "2026-07-01T08:00:00Z",
            planned_date_end: "2026-07-03T08:00:00Z",
        },
        {
            id: 2,
            display_name: "B",
            depend_on_ids: [1],
            planned_date_start: "2026-07-05T08:00:00Z",
            planned_date_end: "2026-07-06T08:00:00Z",
        },
    ];

    function queueMoveOfA(controller) {
        controller.moveQueue.push({
            id: 1,
            data: {
                planned_date_start: "2026-07-02 08:00:00",
                planned_date_end: "2026-07-04 08:00:00",
            },
            item: {
                id: 1,
                start: new Date("2026-07-02T08:00:00Z"),
                end: new Date("2026-07-04T08:00:00Z"),
                evt: RECORDS[0],
            },
            callback: (arg) => controller.spy.callbacks.push(arg),
        });
    }

    test("cascade choice writes the moved task and shifts the dependent", async () => {
        const controller = makeController({choice: "cascade", records: RECORDS});
        queueMoveOfA(controller);
        await TimelineController.prototype.internalMove.call(controller);
        const {writes, callbacks, counters} = controller.spy;
        expect(counters().prompted).toBe(1);
        expect(writes.length).toBe(2);
        expect(writes[0].id).toBe(1);
        expect(writes[1].id).toBe(2);
        // B shifted by the same +1 day, time-of-day preserved.
        expect(writes[1].vals.planned_date_start).toInclude("2026-07-06T08:00");
        expect(writes[1].vals.planned_date_end).toInclude("2026-07-07T08:00");
        expect(callbacks.length).toBe(1);
        expect(callbacks[0]).not.toBe(null);
        expect(counters().loads).toBe(1);
        expect(counters().renders).toBe(1);
    });

    test("single choice writes only the moved task", async () => {
        const controller = makeController({choice: "single", records: RECORDS});
        queueMoveOfA(controller);
        await TimelineController.prototype.internalMove.call(controller);
        expect(controller.spy.writes.length).toBe(1);
        expect(controller.spy.writes[0].id).toBe(1);
        expect(controller.spy.counters().loads).toBe(1);
    });

    test("abort snaps the bar back and writes nothing", async () => {
        const controller = makeController({choice: "abort", records: RECORDS});
        queueMoveOfA(controller);
        await TimelineController.prototype.internalMove.call(controller);
        expect(controller.spy.writes.length).toBe(0);
        expect(controller.spy.callbacks).toEqual([null]);
        expect(controller.spy.counters().loads).toBe(0);
    });

    test("no dependents: no prompt, stock-like write", async () => {
        const noDeps = RECORDS.map((rec) => ({...rec, depend_on_ids: []}));
        const controller = makeController({choice: "cascade", records: noDeps});
        controller.moveQueue.push({
            id: 1,
            data: {planned_date_start: "2026-07-02 08:00:00"},
            item: {
                id: 1,
                start: new Date("2026-07-02T08:00:00Z"),
                end: new Date("2026-07-04T08:00:00Z"),
                evt: noDeps[0],
            },
            callback: (arg) => controller.spy.callbacks.push(arg),
        });
        await TimelineController.prototype.internalMove.call(controller);
        expect(controller.spy.counters().prompted).toBe(0);
        expect(controller.spy.writes.length).toBe(1);
    });
});
