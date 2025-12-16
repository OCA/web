/** @odoo-module */

import {markup} from "@odoo/owl";
import {registry} from "@web/core/registry";

export const busRecordEventService = {
    dependencies: ["bus_service", "notification"],
    start(env, {bus_service, notification}) {
        const subscribers = new Set();

        const displayNotification = (message, options = {}) => {
            notification.add(markup(message), {
                type: "warning",
                sticky: false,
                ...options,
            });
        };

        const processNotification = (notif) => {
            const {payload, type} = notif;
            if (type !== "bus.record/event") {
                return;
            }

            const notify = () => {
                subscribers.forEach((callback) => callback(payload));
            };

            notify();
        };

        const onNotification = ({detail: notifications}) => {
            for (const notif of notifications) {
                processNotification(notif);
            }
        };

        bus_service.addEventListener("notification", onNotification);

        return {
            subscribe(callback) {
                subscribers.add(callback);
                return () => subscribers.delete(callback);
            },
            addChannel(channel) {
                bus_service.addChannel(channel);
            },
            deleteChannel(channel) {
                bus_service.deleteChannel(channel);
            },
            displayNotification,
        };
    },
};

registry.category("services").add("bus_record_event_service", busRecordEventService);
