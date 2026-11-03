import {onWillUnmount, reactive, toRaw, useState} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";

export const HIGHLIGHT_MS = 3000;
// Past this many changed records, one reload would light up most of the view,
// and a highlight that covers everything shows nothing.
export const MAX_HIGHLIGHTED_RECORDS = 10;
export const CHANGED_CLASS = "o_bus_record_events_changed";

// These fields change on every write; kanban cards also load them to bust the
// image cache, so they would mark every written card.
const BOOKKEEPING_FIELDS = new Set(["write_date", "write_uid", "__last_update"]);
// The record was not in the view before the reload: everything it shows is new.
const WHOLE_RECORD = "*";

function recordKey(record) {
    return `${record.resModel},${record.resId}`;
}

/**
 * A comparable form of a field value as the web client holds it.
 *
 * @param {any} value
 * @returns {String}
 */
export function valueKey(value) {
    if (value === null || value === undefined || value === false) {
        return "";
    }
    if (value.isLuxonDateTime) {
        return String(value.toMillis());
    }
    if (typeof value === "object" && "currentIds" in value) {
        // An x2many list: only which records it holds is comparable here.
        return value.currentIds.join(",");
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return "";
        }
    }
    return String(value);
}

function* iterRecords(root) {
    if (root.groups) {
        for (const group of root.groups) {
            if (group.list) {
                yield* iterRecords(group.list);
            }
        }
    } else if (root.records) {
        yield* root.records;
    } else {
        yield root;
    }
}

function snapshot(record) {
    const values = new Map();
    for (const name of Object.keys(record.activeFields)) {
        if (name in record.data && !BOOKKEEPING_FIELDS.has(name)) {
            values.set(name, valueKey(record.data[name]));
        }
    }
    return values;
}

function changedFields(before, after) {
    const changed = new Set();
    for (const [name, key] of after) {
        if (before.has(name) && before.get(name) !== key) {
            changed.add(name);
        }
    }
    return changed;
}

function findChanges(root, before, changes) {
    const found = [];
    for (const record of iterRecords(root)) {
        if (!record.resId || !changes.ids.has(record.resId)) {
            continue;
        }
        if (before.has(record.resId)) {
            const changed = changedFields(before.get(record.resId), snapshot(record));
            if (changed.size) {
                found.push([recordKey(record), changed]);
            }
        } else {
            // Created elsewhere, or changed so that it now matches the
            // domain, group or page: either way the user has not seen it.
            found.push([recordKey(record), WHOLE_RECORD]);
        }
    }
    return found;
}

let liveRegion = null;

function announce(message) {
    if (!liveRegion || !liveRegion.isConnected) {
        liveRegion = document.createElement("div");
        liveRegion.className = "visually-hidden";
        liveRegion.setAttribute("aria-live", "polite");
        document.body.append(liveRegion);
    }
    // A live region only speaks when its text changes.
    liveRegion.textContent = "";
    browser.setTimeout(() => (liveRegion.textContent = message), 100);
}

/**
 * Reload ``model`` and mark the fields whose shown value changed.
 *
 * Values are compared in the browser, before and after the reload, so the bus
 * event stays id-only and only values the user can read are compared. A change
 * the user made in this view leaves nothing to mark: the view already shows the
 * saved value when the event comes back.
 *
 * @param {Object} model the controller's RelationalModel
 * @param {Object} [options]
 * @param {Boolean} [options.announce] tell screen readers that the record
 *      changed; for single-record views
 * @returns {Function} async ``(changes) => void``, to pass to
 *      ``useRecordStream`` as ``onReload``
 */
export function useRecordHighlights(model, {announce: shouldAnnounce = false} = {}) {
    model.recordHighlights ??= reactive(new Map());
    const marks = model.recordHighlights;
    const timers = new Set();

    onWillUnmount(() => {
        for (const timer of timers) {
            browser.clearTimeout(timer);
        }
        timers.clear();
        marks.clear();
    });

    function mark(key, fieldNames) {
        marks.set(key, fieldNames);
        const timer = browser.setTimeout(() => {
            timers.delete(timer);
            // A newer reload may have marked the record again; leave that one.
            // ``get`` on the reactive map returns a proxy, never ``fieldNames``.
            if (toRaw(marks).get(key) === fieldNames) {
                marks.delete(key);
            }
        }, HIGHLIGHT_MS);
        timers.add(timer);
    }

    return async function reloadWithHighlights(changes) {
        if (!changes || changes.all) {
            await model.load();
            return;
        }
        const before = new Map();
        for (const record of iterRecords(model.root)) {
            if (record.resId && changes.ids.has(record.resId)) {
                before.set(record.resId, snapshot(record));
            }
        }
        await model.load();

        const found = findChanges(model.root, before, changes);
        if (!found.length || found.length > MAX_HIGHLIGHTED_RECORDS) {
            return;
        }
        for (const [key, fieldNames] of found) {
            mark(key, fieldNames);
        }
        if (shouldAnnounce) {
            announce(_t("This record was updated by someone else."));
        }
    };
}

/**
 * Subscribe a component to the highlights of ``model``.
 *
 * @param {Object} [model]
 * @returns {Map|null}
 */
export function useHighlightMarks(model) {
    return model?.recordHighlights ? useState(model.recordHighlights) : null;
}

/**
 * @param {Map|null} marks from ``useHighlightMarks``
 * @param {Object} record
 * @param {String} [fieldName] omit to ask about the record as a whole
 * @returns {Boolean}
 */
export function isHighlighted(marks, record, fieldName) {
    const entry = marks?.get(recordKey(record));
    if (!entry) {
        return false;
    }
    return entry === WHOLE_RECORD || !fieldName || entry.has(fieldName);
}
