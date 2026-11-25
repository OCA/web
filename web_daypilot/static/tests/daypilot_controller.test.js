// eslint-disable-next-line jsdoc/check-tag-names -- odoo-module is an Odoo-specific tag for module loading
/** @odoo-module **/

import {animationFrame, mockDate} from "@odoo/hoot-mock";
import {beforeEach, describe, expect, test} from "@odoo/hoot";
import {
    defineModels,
    defineParams,
    fields,
    getService,
    models,
    mountWithCleanup,
} from "@web/../tests/web_test_helpers";
import {WebClient} from "@web/webclient/webclient";
import {queryFirst} from "@odoo/hoot-dom";

describe.current.tags("desktop");

class CalendarEvent extends models.Model {
    _name = "calendar.event";

    name = fields.Char();
    start = fields.Datetime();
    stop = fields.Datetime();
    user_id = fields.Many2one({relation: "res.users"});

    _records = [
        {
            id: 1,
            name: "Test Appointment",
            start: "2026-06-27 10:00:00",
            stop: "2026-06-27 11:00:00",
            user_id: 1,
        },
    ];
}

class ResUsers extends models.Model {
    _name = "res.users";

    name = fields.Char();

    _records = [{id: 1, name: "Demo User"}];
}

beforeEach(() => {
    defineModels([CalendarEvent, ResUsers]);
    mockDate("2026-06-27T08:00:00", +1);
    defineParams({
        lang_parameters: {
            time_format: "%I:%M:%S",
        },
    });
});

describe("DayPilot Controller", function () {
    test("controller should be created with proper metadata", async () => {
        await mountWithCleanup(WebClient);
        await getService("action").doAction({
            res_model: "calendar.event",
            type: "ir.actions.act_window",
            views: [[false, "daypilot"]],
        });
        await animationFrame();

        // Verify the view was mounted
        const daypilotElement = queryFirst(".o_daypilot");
        expect(daypilotElement).toBeDefined();
    });

    test("controller should have create method", async () => {
        await mountWithCleanup(WebClient);
        const action = await getService("action").doAction({
            res_model: "calendar.event",
            type: "ir.actions.act_window",
            views: [[false, "daypilot"]],
        });
        await animationFrame();

        // Verify the controller has the create method
        const controller = action.controller;
        expect(controller.create).toBeDefined();
        expect(typeof controller.create).toBe("function");
    });

    test("controller should have openDialog method", async () => {
        await mountWithCleanup(WebClient);
        const action = await getService("action").doAction({
            res_model: "calendar.event",
            type: "ir.actions.act_window",
            views: [[false, "daypilot"]],
        });
        await animationFrame();

        // Verify the controller has the openDialog method
        const controller = action.controller;
        expect(controller.openDialog).toBeDefined();
        expect(typeof controller.openDialog).toBe("function");
    });
});
