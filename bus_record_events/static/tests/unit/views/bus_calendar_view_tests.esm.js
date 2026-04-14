/** @odoo-module */
/* global QUnit */

import "@bus_record_events/js/views/calendar/bus_calendar_controller.esm";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {getFixture} from "@web/../tests/helpers/utils";
import {registry} from "@web/core/registry";
import {waitForDebounce} from "@bus_record_events/../tests/helpers/test_utils.esm";

let serverData = null;
let busCallback = null;

QUnit.module("Views", (hooks) => {
    hooks.beforeEach(() => {
        getFixture();
        serverData = {
            models: {
                partner: {
                    fields: {
                        foo: {string: "Foo", type: "char"},
                        date_start: {string: "Date", type: "date"},
                    },
                    records: [{id: 1, foo: "yop", date_start: "2023-01-01"}],
                },
            },
        };
        setupViewRegistries();

        const serviceMock = {
            addChannel: () => null,
            subscribe: (callback) => {
                busCallback = callback;
                return () => null;
            },
            displayNotification: () => null,
        };
        registry.category("services").add(
            "bus_record_event_service",
            {
                start: () => serviceMock,
            },
            {force: true}
        );
    });

    QUnit.module("BusCalendarView");

    QUnit.test("calendar view reloads on bus event", async function (assert) {
        await makeView({
            type: "calendar",
            resModel: "partner",
            serverData,
            arch: '<calendar js_class="bus_record_event_calendar" date_start="date_start"><field name="foo"/></calendar>',
            mockRPC: (route, args) => {
                if (args.method === "search_read") {
                    assert.step("search_read");
                } else if (args.method === "check_access_rights") {
                    return true;
                }
            },
        });

        assert.verifySteps(["search_read"]);

        // Simulate notification (debounced)
        await busCallback({model: "partner", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps(["search_read"]);
    });
});
