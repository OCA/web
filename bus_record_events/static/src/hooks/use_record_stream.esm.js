import {onMounted, onWillUnmount, status, useComponent} from "@odoo/owl";
import {browser} from "@web/core/browser/browser";
import {useService} from "@web/core/utils/hooks";

export const DEBOUNCE_MS = 300;
export const BUSY_RETRY_MS = 2000;
export const DEFAULT_MIN_INTERVAL_MS = 5000;

/**
 * Reload a view when records of ``resModel`` change on the server.
 *
 * Events are collapsed: a burst of changes gives one reload, and two reloads are
 * at least ``minInterval`` apart, so a model that changes constantly costs each
 * open view one reload per interval. No reload runs while the tab is hidden or
 * while ``isBusy`` says the user is in the middle of something; the reload is
 * kept and runs once the tab is visible and the user is done.
 *
 * @param {String} resModel
 * @param {Object} options
 * @param {Function} options.onReload async, reloads the view. Receives the
 *      changes collected since the last reload: ``{all, ids, created}``, where
 *      ``ids`` and ``created`` are Sets of record ids and ``all`` is true when an
 *      event was too large to list its ids.
 * @param {Function} [options.getResId] for single-record views: returns the id
 *      shown now, or a falsy value when there is none (new record). Only events
 *      about that id are kept. Read on every event because the form pager
 *      changes the record without remounting the controller.
 * @param {Function} [options.onDeleted] single-record views: the shown record
 *      was deleted elsewhere
 * @param {Function} [options.isBusy] async, true to postpone the reload
 * @param {Function} [options.onBusy] called once when a reload is postponed
 * @param {Number} [options.minInterval]
 */
export function useRecordStream(
    resModel,
    {
        onReload,
        getResId,
        onDeleted,
        isBusy,
        onBusy,
        minInterval = DEFAULT_MIN_INTERVAL_MS,
    }
) {
    const component = useComponent();
    const recordEvents = useService("bus_record_event_service");
    let unsubscribe = null;
    let timer = null;
    let changes = null;
    let busyReported = false;
    let lastReload = null;

    const isMounted = () => status(component) === "mounted";

    function clearTimer() {
        if (timer !== null) {
            browser.clearTimeout(timer);
            timer = null;
        }
    }

    function nextDelay() {
        if (lastReload === null) {
            return DEBOUNCE_MS;
        }
        return Math.max(DEBOUNCE_MS, lastReload + minInterval - Date.now());
    }

    async function run() {
        timer = null;
        if (!changes || !isMounted() || document.visibilityState === "hidden") {
            return;
        }
        if (isBusy && (await isBusy())) {
            if (!busyReported) {
                busyReported = true;
                onBusy?.();
            }
            timer = browser.setTimeout(run, BUSY_RETRY_MS);
            return;
        }
        if (!isMounted()) {
            return;
        }
        const batch = changes;
        changes = null;
        busyReported = false;
        lastReload = Date.now();
        try {
            await onReload(batch);
        } catch (error) {
            // A background refresh must not open an error dialog in front of
            // the user, who did not ask for it. The next event retries.
            console.warn("bus_record_events: reload failed", error);
        }
    }

    function schedule(delay) {
        if (timer === null) {
            timer = browser.setTimeout(run, delay);
        }
    }

    function collect(payload) {
        changes ??= {all: false, ids: new Set(), created: new Set()};
        changes.all ||= Boolean(payload.reload);
        for (const id of payload.written ?? []) {
            changes.ids.add(id);
        }
        for (const id of payload.created ?? []) {
            changes.ids.add(id);
            changes.created.add(id);
        }
    }

    function onEvent(payload) {
        if (payload.model !== resModel || !isMounted()) {
            return;
        }
        if (getResId) {
            const resId = getResId();
            if (!resId) {
                return;
            }
            if (payload.unlinked?.includes(resId)) {
                clearTimer();
                changes = null;
                onDeleted?.();
                return;
            }
            if (!payload.reload && !payload.written?.includes(resId)) {
                return;
            }
        }
        collect(payload);
        schedule(nextDelay());
    }

    function onVisibilityChange() {
        if (changes && document.visibilityState === "visible") {
            schedule(nextDelay());
        }
    }

    onMounted(() => {
        unsubscribe = recordEvents.subscribe(resModel, onEvent);
        document.addEventListener("visibilitychange", onVisibilityChange);
    });

    onWillUnmount(() => {
        clearTimer();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        unsubscribe?.();
        unsubscribe = null;
    });
}
