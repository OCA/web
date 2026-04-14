/** @odoo-module */
/* global QUnit */

import "@bus_record_events/js/views/form/bus_form_controller.esm";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {getFixture} from "@web/../tests/helpers/utils";
import {registry} from "@web/core/registry";
import {waitForDebounce} from "@bus_record_events/../tests/helpers/test_utils.esm";

let serverData = null;
let target = null;
let busCallback = null;
let assertCallback = null;

QUnit.module("Views", (hooks) => {
    hooks.beforeEach(() => {
        target = getFixture();
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
            displayNotification: (msg) => assertCallback.step(`notify:${msg}`),
        };
        registry.category("services").add(
            "bus_record_event_service",
            {
                start: () => serviceMock,
            },
            {force: true}
        );
    });

    QUnit.module("BusFormView");

    QUnit.test("form view handles updates and dirty state", async function (assert) {
        await makeView({
            type: "form",
            resModel: "partner",
            resId: 1,
            serverData,
            arch: '<form js_class="bus_record_event_form"><field name="foo"/></form>',
            mockRPC: (route, args) => {
                if (args.method === "web_read") {
                    assert.step("web_read");
                }
            },
        });

        assert.verifySteps(["web_read"]);

        // Simulate notification (clean state, debounced)
        await busCallback({model: "partner", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps(["web_read"]);
    });

    QUnit.test("form view notifies on update when dirty", async function (assert) {
        assertCallback = assert;
        await makeView({
            type: "form",
            resModel: "partner",
            resId: 1,
            serverData,
            arch: '<form js_class="bus_record_event_form"><field name="foo"/></form>',
        });

        // Make dirty
        const input = target.querySelector(".o_field_widget[name='foo'] input");
        input.value = "bar";
        input.dispatchEvent(new Event("input", {bubbles: true}));
        input.dispatchEvent(new Event("change", {bubbles: true}));

        // Simulate notification (debounced)
        await busCallback({model: "partner", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps([
            "notify:Records updated elsewhere, but you have unsaved changes.",
        ]);
    });
});
