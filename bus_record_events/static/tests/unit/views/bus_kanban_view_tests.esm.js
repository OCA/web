/** @odoo-module */
/* global QUnit */

import "@bus_record_events/js/views/kanban/bus_kanban_controller.esm";
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
                    },
                    records: [{id: 1, foo: "yop"}],
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

    QUnit.module("BusKanbanView");

    QUnit.test("kanban view reloads on bus event", async function (assert) {
        await makeView({
            type: "kanban",
            resModel: "partner",
            serverData,
            arch: '<kanban js_class="bus_record_event_kanban"><templates><t t-name="kanban-box"><field name="foo"/></t></templates></kanban>',
            mockRPC: (route, args) => {
                if (args.method === "web_search_read") {
                    assert.step("web_search_read");
                }
            },
        });

        assert.verifySteps(["web_search_read"]);

        // Simulate notification (debounced)
        await busCallback({model: "partner", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps(["web_search_read"]);
    });
});
