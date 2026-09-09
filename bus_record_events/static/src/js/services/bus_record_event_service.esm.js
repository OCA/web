/** @odoo-module */

import {markup} from "@odoo/owl";
import {registry} from "@web/core/registry";

export const busRecordEventService = {
    dependencies: ["bus_service", "notification"],
    start(env, {bus_service, notification}) {
        const subscribers = new Set();
        const channelRefCounts = new Map();

        const displayNotification = (message, options = {}) => {
            notification.add(markup(message), {
                type: "warning",
                sticky: false,
                ...options,
            });
        };

        // eslint-disable-next-line valid-jsdoc
        /**
         * Build a deduplication key for a bus.record/event payload.
         * - create events: one per model (list views just need one reload)
         * - write/unlink events: one per model+record (form views need per-record granularity)
         */
        const getDeduplicationKey = (payload) => {
            if (payload.type === "create") {
                return `${payload.model}::create`;
            }
            const recordId = payload.id || (payload.data && payload.data.id) || null;
            return `${payload.model}:${recordId}:${payload.type}`;
        };

        const onNotification = ({detail: notifications}) => {
            const deduped = new Map();
            for (const notif of notifications) {
                const {payload, type} = notif;
                if (type !== "bus.record/event") {
                    continue;
                }
                deduped.set(getDeduplicationKey(payload), payload);
            }
            for (const payload of deduped.values()) {
                subscribers.forEach((callback) => callback(payload));
            }
        };

        bus_service.addEventListener("notification", onNotification);

        return {
            subscribe(callback) {
                subscribers.add(callback);
                return () => subscribers.delete(callback);
            },
            addChannel(channel) {
                const count = (channelRefCounts.get(channel) || 0) + 1;
                channelRefCounts.set(channel, count);
                if (count === 1) {
                    bus_service.addChannel(channel);
                }
            },
            deleteChannel(channel) {
                const count = channelRefCounts.get(channel);
                if (!count) {
                    return;
                }
                if (count <= 1) {
                    channelRefCounts.delete(channel);
                    bus_service.deleteChannel(channel);
                } else {
                    channelRefCounts.set(channel, count - 1);
                }
            },
            displayNotification,
        };
    },
};

registry.category("services").add("bus_record_event_service", busRecordEventService);
