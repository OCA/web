/** @odoo-module */
/* global QUnit */

import "@bus_record_events/js/views/graph/bus_graph_controller.esm";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {getFixture} from "@web/../tests/helpers/utils";
import {registry} from "@web/core/registry";

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
                            store: true,
                            group_operator: "sum",
                            sortable: true,
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

    QUnit.module("BusGraphView");

    QUnit.test("graph view reloads on bus event", async function (assert) {
        await makeView({
            type: "graph",
            resModel: "partner",
            serverData,
            arch: '<graph js_class="bus_record_event_graph"><field name="foo" type="measure"/></graph>',
            mockRPC: (route, args) => {
                if (args.method === "web_read_group") {
                    assert.step("web_read_group");
                }
            },
        });

        assert.verifySteps(["web_read_group"]);

        // Simulate notification
        await busCallback({model: "partner", type: "write", data: {id: 1}});
        assert.verifySteps(["web_read_group"]);
    });
});
