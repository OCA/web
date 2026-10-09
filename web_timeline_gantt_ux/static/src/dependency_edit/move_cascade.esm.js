/** @odoo-module **/

import {_t} from "@web/core/l10n/translation";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Classify a queued vis move as a pure time-shift or a resize. A center drag
 * preserves the duration exactly (vis recomputes end = start + duration from
 * the pre-drag clone), so equal durations with a nonzero start delta means
 * "moved in time"; anything else is an edge resize. Pure and exported for
 * DOM-free tests.
 *
 * @param {Object} dates JS Dates (or null when a bound is absent)
 * @param {Date|null} dates.oldStart
 * @param {Date|null} dates.oldEnd
 * @param {Date|null} dates.newStart
 * @param {Date|null} dates.newEnd
 * @returns {{timeMove: Boolean, deltaMs: Number}}
 */
export function classifyMove({oldStart, oldEnd, newStart, newEnd}) {
    if (!oldStart || !newStart) {
        return {timeMove: false, deltaMs: 0};
    }
    const deltaMs = newStart.getTime() - oldStart.getTime();
    const oldDuration = oldEnd ? oldEnd.getTime() - oldStart.getTime() : 0;
    const newDuration = newEnd ? newEnd.getTime() - newStart.getTime() : 0;
    return {timeMove: deltaMs !== 0 && oldDuration === newDuration, deltaMs};
}

/**
 * Downstream transitive closure over the LOADED records: which records are
 * (directly or indirectly) blocked by the moved ones, and by how much they
 * would shift. Records outside the current search domain are not loaded and
 * therefore cannot be shifted — the dialog copy says "in this view" for that
 * reason. First-reached root wins when several moved records share a
 * dependent; moved records themselves never appear in the result; records
 * without a start date are traversed (their successors still shift) but not
 * shifted themselves. Cycle-safe via the visited set. Pure and exported for
 * DOM-free tests.
 *
 * @param {Object[]} records loaded records
 * @param {String} depField m2m "blocked by" field name
 * @param {String} dateStartField record field marking a scheduled record
 * @param {Object[]} moves [{id, deltaMs}] classified time-moves
 * @returns {Map<Number, Number>} record id -> deltaMs to apply
 */
export function collectDependentShifts(records, depField, dateStartField, moves) {
    const successorsOf = new Map();
    for (const rec of records) {
        for (const predId of rec[depField] || []) {
            if (!successorsOf.has(predId)) {
                successorsOf.set(predId, []);
            }
            successorsOf.get(predId).push(rec);
        }
    }
    const movedIds = new Set(moves.map((move) => move.id));
    const visited = new Set(movedIds);
    const shifts = new Map();
    for (const {id, deltaMs} of moves) {
        const stack = [id];
        while (stack.length) {
            const current = stack.pop();
            for (const rec of successorsOf.get(current) || []) {
                if (visited.has(rec.id)) {
                    continue;
                }
                visited.add(rec.id);
                if (rec[dateStartField]) {
                    shifts.set(rec.id, deltaMs);
                }
                stack.push(rec.id);
            }
        }
    }
    return shifts;
}

/**
 * Human label for a shift: whole days when the delta is day-aligned (the
 * usual case with day-snapped drags), hours otherwise.
 *
 * @param {Number} deltaMs signed shift in milliseconds
 * @returns {String} e.g. "+2 days", "-1 day", "+5 hours"
 */
export function formatDeltaLabel(deltaMs) {
    const sign = deltaMs < 0 ? "-" : "+";
    const abs = Math.abs(deltaMs);
    if (abs % DAY_MS === 0) {
        const days = abs / DAY_MS;
        return days === 1 ? _t("%s1 day", sign) : _t("%s%s days", sign, days);
    }
    const hours = Math.round((abs / HOUR_MS) * 10) / 10;
    return hours === 1 ? _t("%s1 hour", sign) : _t("%s%s hours", sign, hours);
}
