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
            data: {id: 1},
        };
        busService.trigger("notification", [{type: "bus.record/event", payload}]);

        assert.deepEqual(receivedPayload, payload, "Subscriber received the payload");
    });
});
