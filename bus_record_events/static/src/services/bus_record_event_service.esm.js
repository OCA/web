import {registry} from "@web/core/registry";
import {rpcBus} from "@web/core/network/rpc";

export const CHANNEL_PREFIX = "record_events:";
export const NOTIFICATION_TYPE = "bus.record/event";
export const TOKEN_KEY = "bus_record_events_token";

/**
 * Random per tab. The server echoes it in ``origins`` so the tab can tell its
 * own changes from everyone else's.
 */
export const TAB_TOKEN = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) =>
    n.toString(36)
).join("");

/**
 * Put the token in the JSON-RPC envelope, next to ``params``. Inside the
 * context it would be copied into the actions and filters the server returns,
 * and into the key of the RPC cache; inside ``params`` the server would pass
 * it to the route as an argument. Routes and test mock servers only read
 * ``params``, so the envelope member reaches this module alone.
 *
 * @param {CustomEvent} ev
 */
function addTabToken({detail}) {
    detail.data[TOKEN_KEY] = TAB_TOKEN;
}

rpcBus.addEventListener("RPC:REQUEST", addTabToken);

/**
 * @param {Object} payload
 * @returns {Boolean} true when only this tab made the changes
 */
export function isOwnEvent(payload) {
    const origins = payload.origins;
    return Boolean(origins?.length) && origins.every((origin) => origin === TAB_TOKEN);
}

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
        // ``addChannel`` waits for the worker before it sends; ``deleteChannel``
        // sends at once. A delete issued in between would reach the worker
        // first and leave the channel subscribed with no view listening.
        const channelAdded = new Map();

        bus_service.subscribe(NOTIFICATION_TYPE, (payload) => {
            if (isOwnEvent(payload)) {
                return;
            }
            for (const listener of [...listeners]) {
                listener(payload);
            }
        });

        function release(channel) {
            const deleteIfUnused = () => {
                if (!refCounts.has(channel)) {
                    bus_service.deleteChannel(channel);
                }
            };
            Promise.resolve(channelAdded.get(channel)).then(
                deleteIfUnused,
                deleteIfUnused
            );
        }

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
                    channelAdded.set(channel, bus_service.addChannel(channel));
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
                        release(channel);
                    }
                };
            },
        };
    },
};

registry.category("services").add("bus_record_event_service", busRecordEventService);
