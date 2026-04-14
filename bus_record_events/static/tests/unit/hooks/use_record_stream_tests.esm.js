/** @odoo-module */
/* global QUnit */

import {Component, mount, xml} from "@odoo/owl";
import {getFixture} from "@web/../tests/helpers/utils";
import {makeTestEnv} from "@web/../tests/helpers/mock_env";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../../src/js/hooks/use_record_stream.esm";
import {waitForDebounce} from "@bus_record_events/../tests/helpers/test_utils.esm";

QUnit.module("Hooks", {}, function () {
    QUnit.module("useRecordStream");

    QUnit.test("subscribes to channel and handles updates", async function (assert) {
        const serviceMock = {
            addChannel: (channel) => assert.step(`addChannel:${channel}`),
            subscribe: (callback) => {
                assert.step("subscribe");
                this.callback = callback;
            },
            displayNotification: (msg) => assert.step(`notify:${msg}`),
        };

        registry.category("services").add("bus_record_event_service", {
            start: () => serviceMock,
        });

        class TestComponent extends Component {
            setup() {
                useRecordStream("test.model", {
                    onReload: () => assert.step("reload"),
                });
            }
        }
        TestComponent.template = xml`<div/>`;

        const env = await makeTestEnv();
        const target = getFixture();
        await mount(TestComponent, target, {env});

        assert.verifySteps(["addChannel:record_events:test.model", "subscribe"]);

        // Simulate notification (debounced)
        await this.callback({
            model: "test.model",
            type: "write",
            data: {id: 1},
        });
        await waitForDebounce();
        assert.verifySteps(["reload"]);

        // Simulate notification for another model
        await this.callback({
            model: "other.model",
            type: "write",
            data: {id: 1},
        });
        await waitForDebounce();
        assert.verifySteps([]);
    });

    QUnit.test("handles dirty state", async function (assert) {
        const serviceMock = {
            addChannel: () => null,
            subscribe: (callback) => {
                this.callback = callback;
                return () => null;
            },
            displayNotification: (msg) => assert.step(`notify:${msg}`),
        };

        registry.category("services").add("bus_record_event_service", {
            start: () => serviceMock,
        });

        class TestComponent extends Component {
            setup() {
                useRecordStream("test.model", {
                    isDirty: () => true,
                    onReload: () => assert.step("reload"),
                });
            }
        }
        TestComponent.template = xml`<div/>`;

        const env = await makeTestEnv();
        const target = getFixture();
        await mount(TestComponent, target, {env});

        // Simulate notification (debounced)
        await this.callback({model: "test.model", type: "write", data: {id: 1}});
        await waitForDebounce();
        assert.verifySteps([
            "notify:Records updated elsewhere, but you have unsaved changes.",
        ]);
    });
});
