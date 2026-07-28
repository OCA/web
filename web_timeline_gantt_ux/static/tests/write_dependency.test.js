/** @odoo-module **/

import {describe, expect, test} from "@odoo/hoot";
import {TimelineController} from "@web_timeline/views/timeline/timeline_controller.esm";

function makeController({writeError} = {}) {
    const calls = {writes: [], loads: 0, renders: 0, notifications: []};
    const controller = {
        model: {
            params: {dependency_arrow: "depend_on_ids"},
            write_completed: (id, vals) => {
                calls.writes.push([id, vals]);
                return writeError ? Promise.reject(writeError) : Promise.resolve();
            },
            load: () => {
                calls.loads++;
                return Promise.resolve();
            },
            data: [
                {id: 1, display_name: "A"},
                {id: 2, display_name: "B"},
            ],
        },
        getSearchProps: () => ({}),
        render: () => {
            calls.renders++;
        },
        tlgNotification: {
            add: (message, options) => {
                calls.notifications.push([message, options]);
                return () => {
                    return;
                };
            },
        },
    };
    return {controller, calls};
}

describe("web_timeline_gantt_ux dependency writes", () => {
    test("successful write reloads once and reports success", async () => {
        const {controller, calls} = makeController();
        const created = await TimelineController.prototype._tlgWriteDependency.call(
            controller,
            2,
            [[4, 1]]
        );
        expect(created).toBe(true);
        expect(calls.writes).toEqual([[2, {depend_on_ids: [[4, 1]]}]]);
        expect(calls.loads).toBe(1);
        expect(calls.renders).toBe(1);
    });

    test("server ValidationError becomes a danger toast, no reload", async () => {
        const {controller, calls} = makeController({
            writeError: {
                exceptionName: "odoo.exceptions.ValidationError",
                data: {message: "cycle detected"},
            },
        });
        const created = await TimelineController.prototype._tlgWriteDependency.call(
            controller,
            2,
            [[4, 1]]
        );
        expect(created).toBe(false);
        expect(calls.loads).toBe(0);
        expect(calls.notifications.length).toBe(1);
        expect(calls.notifications[0][0]).toInclude("cycle detected");
        expect(calls.notifications[0][1].type).toBe("danger");
    });

    test("unexpected errors are rethrown to the crash handler", async () => {
        const boom = new Error("boom");
        const {controller, calls} = makeController({writeError: boom});
        let caught = null;
        try {
            await TimelineController.prototype._tlgWriteDependency.call(controller, 2, [
                [4, 1],
            ]);
        } catch (error) {
            caught = error;
        }
        expect(caught).toBe(boom);
        expect(calls.loads).toBe(0);
        expect(calls.notifications.length).toBe(0);
    });

    test("create success shows the canonical Undo toast", async () => {
        const {controller, calls} = makeController();
        await TimelineController.prototype._onCreateDependency.call(controller, {
            predecessorId: 1,
            successorId: 2,
        });
        expect(calls.notifications.length).toBe(1);
        const [message, options] = calls.notifications[0];
        expect(message).toInclude('"B" is now blocked by "A"');
        expect(options.type).toBe("success");
        expect(options.buttons[0].name).toBe("Undo");
        // Undo issues the unlink write on the successor.
        await options.buttons[0].onClick();
        expect(calls.writes[1]).toEqual([2, {depend_on_ids: [[3, 1]]}]);
    });
});
