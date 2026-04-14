/** @odoo-module */
/* global QUnit */

import "@bus_record_events/js/views/pivot/bus_pivot_controller.esm";
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
                        foo: {
                            string: "Foo",
                            type: "integer",
                            searchable: true,
                            group_operator: "sum",
                        },
                    },
                    records: [
                        {id: 1, foo: 10},
                        {id: 2, foo: 20},
                    ],
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

    QUnit.module("BusPivotView");

    QUnit.test("pivot view reloads on bus event", async function (assert) {
        await makeView({
            type: "pivot",
            resModel: "partner",
            serverData,
            arch: '<pivot js_class="bus_record_event_pivot"><field name="foo" type="measure"/></pivot>',
            mockRPC: (route, args) => {
                if (args.method === "read_group") {
                    assert.step("read_group");
                }
            },
        });

        assert.verifySteps(["read_group"]);

        // Simulate notification (debounced)
        await busCallback({model: "partner", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps(["read_group"]);
    });
});
