/** @odoo-module */
/* global QUnit */

import {EventBus} from "@odoo/owl";
import {busRecordEventService} from "../../../src/js/services/bus_record_event_service.esm";
import {makeTestEnv} from "@web/../tests/helpers/mock_env";
import {registry} from "@web/core/registry";

QUnit.module("Services", {}, function () {
    QUnit.module("bus_record_event_service");

    QUnit.test("can subscribe and receive notifications", async function (assert) {
        const busService = new EventBus();
        busService.addChannel = (channel) => {
            assert.step(`addChannel:${channel}`);
        };

        const notificationService = {
            add: (message) => {
                assert.step(`notification:${message}`);
            },
        };

        const registryMock = registry.category("services");
        registryMock.add("bus_service", {
            start: () => busService,
        });
        registryMock.add("notification", {
            start: () => notificationService,
        });
        registryMock.add("bus_record_event_service", busRecordEventService);

        const env = await makeTestEnv();
        const service = env.services.bus_record_event_service;

        service.addChannel("test_channel");
        assert.verifySteps(["addChannel:test_channel"]);

        let receivedPayload = null;
        service.subscribe((payload) => {
            receivedPayload = payload;
        });

        // Simulate notification
        const payload = {
            model: "test.model",
            type: "create",
            data: {ids: [1]},
        };
        busService.trigger("notification", [{type: "bus.record/event", payload}]);

        assert.deepEqual(receivedPayload, payload, "Subscriber received the payload");
    });

    QUnit.test(
        "addChannel only forwards to bus_service on the first reference",
        async function (assert) {
            const busService = new EventBus();
            busService.addChannel = (channel) => assert.step(`addChannel:${channel}`);
            busService.deleteChannel = (channel) =>
                assert.step(`deleteChannel:${channel}`);

            const registryMock = registry.category("services");
            registryMock.add("bus_service", {start: () => busService});
            registryMock.add("notification", {start: () => ({add: () => null})});
            registryMock.add("bus_record_event_service", busRecordEventService);

            const env = await makeTestEnv();
            const service = env.services.bus_record_event_service;

            service.addChannel("shared_channel");
            service.addChannel("shared_channel");
            assert.verifySteps(
                ["addChannel:shared_channel"],
                "bus_service.addChannel is only called once for two references to the same channel"
            );
        }
    );

    QUnit.test(
        "deleteChannel only forwards to bus_service once every subscriber released the channel, and other subscribers keep receiving notifications meanwhile",
        async function (assert) {
            const busService = new EventBus();
            busService.addChannel = (channel) => assert.step(`addChannel:${channel}`);
            busService.deleteChannel = (channel) =>
                assert.step(`deleteChannel:${channel}`);

            const registryMock = registry.category("services");
            registryMock.add("bus_service", {start: () => busService});
            registryMock.add("notification", {start: () => ({add: () => null})});
            registryMock.add("bus_record_event_service", busRecordEventService);

            const env = await makeTestEnv();
            const service = env.services.bus_record_event_service;

            // Two independent subscribers subscribe to the same channel.
            service.addChannel("shared_channel");
            service.addChannel("shared_channel");
            assert.verifySteps(["addChannel:shared_channel"]);

            let subscriberBPayload = null;
            service.subscribe((payload) => {
                subscriberBPayload = payload;
            });

            // Subscriber A releases the channel; it must stay alive for subscriber B.
            service.deleteChannel("shared_channel");
            assert.verifySteps(
                [],
                "bus_service.deleteChannel is not called while another subscriber still references the channel"
            );

            const payload = {model: "test.model", type: "create", data: {ids: [1]}};
            busService.trigger("notification", [{type: "bus.record/event", payload}]);
            assert.deepEqual(
                subscriberBPayload,
                payload,
                "Subscriber B still receives notifications after subscriber A released the channel"
            );

            // Subscriber B releases the channel; only now it is actually deleted.
            service.deleteChannel("shared_channel");
            assert.verifySteps(
                ["deleteChannel:shared_channel"],
                "bus_service.deleteChannel is called once the last reference is released"
            );
        }
    );

    QUnit.test(
        "deleteChannel on a channel without a matching addChannel is a no-op",
        async function (assert) {
            const busService = new EventBus();
            busService.addChannel = (channel) => assert.step(`addChannel:${channel}`);
            busService.deleteChannel = (channel) =>
                assert.step(`deleteChannel:${channel}`);

            const registryMock = registry.category("services");
            registryMock.add("bus_service", {start: () => busService});
            registryMock.add("notification", {start: () => ({add: () => null})});
            registryMock.add("bus_record_event_service", busRecordEventService);

            const env = await makeTestEnv();
            const service = env.services.bus_record_event_service;

            service.deleteChannel("never_added_channel");
            assert.verifySteps(
                [],
                "no bus_service call is made and no error is thrown"
            );
        }
    );
});
