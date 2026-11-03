import {registry} from "@web/core/registry";

export const CHANNEL_PREFIX = "record_events:";
export const NOTIFICATION_TYPE = "bus.record/event";

/**
 * Shares one bus channel per model between every view that watches it.
 *
 * The server drops channels for models that are not broadcast, or that the user
 * cannot read, so subscribing to a model that never emits costs nothing.
 */
export const busRecordEventService = {
    dependencies: ["bus_service"],
    start(env, {bus_service}) {
        const listeners = new Set();
        const refCounts = new Map();

        bus_service.subscribe(NOTIFICATION_TYPE, (payload) => {
            for (const listener of [...listeners]) {
                listener(payload);
            }
        });

        return {
            /**
             * @param {String} resModel
             * @param {Function} listener called with each event payload
             * @returns {Function} unsubscribe
             */
            subscribe(resModel, listener) {
                const channel = `${CHANNEL_PREFIX}${resModel}`;
                const count = (refCounts.get(channel) || 0) + 1;
                refCounts.set(channel, count);
                if (count === 1) {
                    bus_service.addChannel(channel);
                }
                listeners.add(listener);
                let subscribed = true;
                return () => {
                    if (!subscribed) {
                        return;
                    }
                    subscribed = false;
                    listeners.delete(listener);
                    const remaining = (refCounts.get(channel) || 1) - 1;
                    if (remaining > 0) {
                        refCounts.set(channel, remaining);
                    } else {
                        refCounts.delete(channel);
                        bus_service.deleteChannel(channel);
                    }
                };
            },
        };
    },
};

registry.category("services").add("bus_record_event_service", busRecordEventService);
