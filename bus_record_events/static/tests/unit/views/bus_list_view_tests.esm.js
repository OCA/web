/** @odoo-module */
/* global QUnit */

import "@bus_record_events/js/views/list/bus_list_controller.esm";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {busRecordEventService} from "@bus_record_events/js/services/bus_record_event_service.esm";
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
                "res.partner": {
                    fields: {
                        foo: {string: "Foo", type: "char"},
                    },
                    records: [
                        {id: 1, foo: "yop"},
                        {id: 2, foo: "blip"},
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

    QUnit.module("BusListView");

    QUnit.test("list view reloads on bus event", async function (assert) {
        await makeView({
            type: "list",
            resModel: "res.partner",
            serverData,
            arch: '<tree js_class="bus_record_event_list"><field name="foo"/></tree>',
            mockRPC: (route, args) => {
                if (args.method === "web_search_read") {
                    assert.step("web_search_read");
                }
            },
        });

        assert.verifySteps(["web_search_read"]);

        // Simulate notification (debounced)
        await busCallback({model: "res.partner", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps(["web_search_read"]);
    });

    QUnit.test(
        "burst of notifications after idle only triggers one reload",
        async function (assert) {
            const busTarget = new EventTarget();
            busTarget.addChannel = () => null;
            busTarget.deleteChannel = () => null;

            registry
                .category("services")
                .add("bus_service", {start: () => busTarget}, {force: true});
            registry
                .category("services")
                .add("notification", {start: () => ({add: () => null})}, {force: true});
            registry
                .category("services")
                .add("bus_record_event_service", busRecordEventService, {force: true});

            await makeView({
                type: "list",
                resModel: "res.partner",
                serverData,
                arch: '<tree js_class="bus_record_event_list"><field name="foo"/></tree>',
                mockRPC: (route, args) => {
                    if (args.method === "web_search_read") {
                        assert.step("web_search_read");
                    }
                },
            });

            // Initial load: 1 web_search_read
            assert.verifySteps(["web_search_read"]);

            // We simulate a massive surge: what happens when a user returns
            // after a long period and `last_notification_id` is very old.
            // 50 creates + 30 writes (different IDs) + 20 unlinks (different IDs)
            const notifications = [];
            for (let i = 0; i < 50; i++) {
                notifications.push({
                    type: "bus.record/event",
                    payload: {
                        model: "res.partner",
                        type: "create",
                        data: {ids: [100 + i]},
                    },
                });
            }
            for (let i = 0; i < 30; i++) {
                notifications.push({
                    type: "bus.record/event",
                    payload: {model: "res.partner", type: "write", data: {id: 200 + i}},
                });
            }
            for (let i = 0; i < 20; i++) {
                notifications.push({
                    type: "bus.record/event",
                    payload: {model: "res.partner", type: "unlink", id: 300 + i},
                });
            }
            // We have also included other types of notifications that should be ignored
            for (let i = 0; i < 10; i++) {
                notifications.push({
                    type: "mail.channel/new_message",
                    payload: {id: i},
                });
            }

            // We fire the entire burst in one go (a single pull of the trigger)
            busTarget.dispatchEvent(
                new CustomEvent("notification", {detail: notifications})
            );

            await waitForDebounce();

            // After dedup + debounce: exactly 1 web_search_read
            assert.verifySteps(["web_search_read"]);
        }
    );
});
