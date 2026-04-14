/** @odoo-module */

import {onMounted, onWillStart, onWillUnmount, status, useComponent} from "@odoo/owl";
import {browser} from "@web/core/browser/browser";
import {useService} from "@web/core/utils/hooks";

const DEBOUNCE_MS = 200;

/**
 * Hook to subscribe to record events.
 * @param {String} model The model to observe.
 * @param {Object} options
 * @param {number|string} [options.id] The specific record ID to observe.
 * @param {function(Object): boolean} [options.filter] Pure function to filter events.
 * @param {function(Object): void} [options.onUpdate] Custom callback to execute when an event matches.
 * @param {function(): Promise<boolean>} [options.isDirty] Callback to check if the view is dirty.
 * @param {function(): Promise<void>} [options.onReload] Callback to reload the view.
 * @param {function(): void} [options.onRecordDeleted] Callback when the observed record is deleted (only if id is provided).
 */
export function useRecordStream(
    model,
    {id, filter, onUpdate, isDirty, onReload, onRecordDeleted} = {}
) {
    const component = useComponent();
    const service = useService("bus_record_event_service");
    let unsubscribe = null;
    let debounceTimer = null;

    const clearDebounce = () => {
        if (debounceTimer !== null) {
            browser.clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    };

    const scheduleDebounced = (action) => {
        clearDebounce();
        debounceTimer = browser.setTimeout(async () => {
            debounceTimer = null;
            if (status(component) !== "destroyed") {
                await action();
            }
        }, DEBOUNCE_MS);
    };

    const handleUnlink = async (dirty) => {
        if (dirty) {
            service.displayNotification(
                "Record deleted elsewhere, but you have unsaved changes."
            );
            return;
        }
        if (id && onRecordDeleted) {
            service.displayNotification("Record deleted. Returning to list view.");
            onRecordDeleted();
        } else if (onReload) {
            await onReload();
        }
    };

    const handleUpdate = async (dirty) => {
        if (dirty) {
            service.displayNotification(
                "Records updated elsewhere, but you have unsaved changes."
            );
        } else if (onReload) {
            await onReload();
        }
    };

    const handleNotification = async (payload) => {
        if (status(component) === "destroyed") {
            return;
        }
        if (payload.model !== model) {
            return;
        }
        // If we are listening to a specific record, filter by ID
        if (id) {
            // For unlink, payload has 'id'. For create/write, payload has 'data.id'.
            const payloadId = payload.id || (payload.data && payload.data.id);
            if (payloadId !== id) {
                return;
            }
        }

        if (filter && !(await filter(payload))) {
            return;
        }

        // Custom onUpdate: debounce all events (list views just need one reload)
        if (onUpdate) {
            scheduleDebounced(() => onUpdate(payload));
            return;
        }

        // Unlink on a specific record: handle immediately (user must be redirected)
        if (payload.type === "unlink" && id) {
            clearDebounce();
            const dirty = isDirty ? await isDirty() : false;
            await handleUnlink(dirty);
            return;
        }

        // All other events: debounce to collapse rapid-fire notifications
        scheduleDebounced(async () => {
            const dirty = isDirty ? await isDirty() : false;
            if (payload.type === "unlink") {
                await handleUnlink(dirty);
            } else {
                await handleUpdate(dirty);
            }
        });
    };

    onWillStart(() => {
        const channel = id ? `record_events:${model}:${id}` : `record_events:${model}`;
        service.addChannel(channel);
    });

    onMounted(() => {
        unsubscribe = service.subscribe(handleNotification);
    });

    onWillUnmount(() => {
        clearDebounce();
        if (unsubscribe) {
            unsubscribe();
        }
    });
}
