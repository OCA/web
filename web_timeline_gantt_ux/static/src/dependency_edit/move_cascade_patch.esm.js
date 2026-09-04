/** @odoo-module **/

import {Component} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {TimelineController} from "@web_timeline/views/timeline/timeline_controller.esm";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {
    classifyMove,
    collectDependentShifts,
    formatDeltaLabel,
} from "@web_timeline_gantt_ux/dependency_edit/move_cascade.esm";

/**
 * Three-way choice for a time-move whose task has dependents: shift the
 * dependents along, move only the dragged task, or cancel the move entirely
 * (Esc / X count as cancel — the bar snaps back).
 */
export class MoveCascadeDialog extends Component {
    static template = "web_timeline_gantt_ux.MoveCascadeDialog";
    static components = {Dialog};
    static props = {
        close: Function,
        title: String,
        body: String,
        onChoice: Function,
    };

    choose(choice) {
        this.props.onChoice(choice);
        this.props.close();
    }
}

patch(TimelineController.prototype, {
    /**
     * Gantt mode replaces the stock drain: when a queued move is a pure
     * time-shift and other loaded records are (transitively) blocked by it,
     * ask whether the dependents shift along. COUPLING: mirrors the stock
     * internalMove contract — drain this.moveQueue, write, invoke each
     * entry's vis callback (truthy applies the drop, null snaps the bar
     * back), then reload once.
     *
     * @override
     */
    async internalMove() {
        if (!this.props.modelParams.gantt_ux || !this.model.params.dependency_arrow) {
            return super.internalMove(...arguments);
        }
        // Serialize drains: a second drag while the dialog is open must wait
        // for the decision, not interleave writes or stack dialogs. The
        // stored chain swallows rejections so one failed drain cannot poison
        // the next; the returned promise still rejects like the stock path.
        const run = (this._tlgMoveChain || Promise.resolve()).then(() =>
            this._tlgGanttInternalMove()
        );
        this._tlgMoveChain = run.catch(() => {
            // Chain keep-alive only; the error surfaces via `run`.
        });
        return run;
    },

    async _tlgGanttInternalMove() {
        const queue = this.moveQueue.slice();
        this.moveQueue = [];
        if (!queue.length) {
            return;
        }
        const depField = this.model.params.dependency_arrow;
        const records = this.model.data || [];
        const byId = new Map(records.map((rec) => [rec.id, rec]));
        // Classify each queued entry in the same date frame vis uses
        // (model.parseDate mirrors what _event_data_transform fed vis).
        const moves = [];
        for (const entry of queue) {
            const rec = entry.item.evt || {};
            const oldStart = rec[this.date_start]
                ? this.model
                      .parseDate(
                          this.model.fields[this.date_start],
                          rec[this.date_start]
                      )
                      .toJSDate()
                : null;
            const oldEnd =
                this.date_stop && rec[this.date_stop]
                    ? this.model
                          .parseDate(
                              this.model.fields[this.date_stop],
                              rec[this.date_stop]
                          )
                          .toJSDate()
                    : null;
            const {timeMove, deltaMs} = classifyMove({
                oldStart,
                oldEnd,
                newStart: entry.item.start || null,
                newEnd: entry.item.end || null,
            });
            if (timeMove) {
                moves.push({id: entry.id, deltaMs});
            }
        }
        const shifts = moves.length
            ? collectDependentShifts(records, depField, this.date_start, moves)
            : new Map();
        let choice = "single";
        if (shifts.size) {
            choice = await new Promise((resolve) => {
                this.dialogService.add(
                    MoveCascadeDialog,
                    {
                        title: _t("Shift dependent tasks?"),
                        body: this._tlgCascadeBody(moves, shifts),
                        onChoice: resolve,
                    },
                    {onClose: () => resolve("abort")}
                );
            });
        }
        if (choice === "abort") {
            for (const entry of queue) {
                entry.callback(null);
            }
            return;
        }
        const pendingRevert = queue.slice();
        try {
            for (const entry of queue) {
                await this.model.write_completed(entry.id, entry.data);
                entry.callback(entry.item);
                pendingRevert.shift();
            }
            if (choice === "cascade") {
                for (const [id, deltaMs] of shifts) {
                    await this.model.write_completed(
                        id,
                        this._tlgShiftedDates(byId.get(id), deltaMs)
                    );
                }
            }
        } catch (error) {
            // Stock internalMove has no error path at all (bars stay at the
            // drop position with nothing written). Snap back what was not
            // applied, resync from the server, and surface user-facing
            // rejections as a toast; crashes still crash.
            for (const entry of pendingRevert) {
                entry.callback(null);
            }
            await this.model.load(this.getSearchProps());
            this.render();
            const exceptionName = error?.exceptionName || error?.data?.name || "";
            const isUserFacing = [
                "odoo.exceptions.ValidationError",
                "odoo.exceptions.UserError",
            ].includes(exceptionName);
            if (!isUserFacing) {
                throw error;
            }
            this.tlgNotification.add(error.data?.message || error.message, {
                title: _t("Move not saved"),
                type: "danger",
            });
            return;
        }
        // The gantt renderer suppresses the stock auto-fit, so this reload
        // does not move the window.
        await this.model.load(this.getSearchProps());
        this.render();
    },

    _tlgCascadeBody(moves, shifts) {
        const count = shifts.size;
        if (moves.length === 1) {
            const record = (this.model.data || []).find(
                (rec) => rec.id === moves[0].id
            );
            return _t(
                '"%s" moves by %s. %s dependent task(s) in this view follow it. Shift them as well?',
                record?.display_name || `#${moves[0].id}`,
                formatDeltaLabel(moves[0].deltaMs),
                count
            );
        }
        return _t(
            "%s dependent task(s) in this view follow the moved tasks. Shift them as well?",
            count
        );
    },

    /**
     * Shift a record's date fields by deltaMs, preserving its time-of-day
     * and duration. Serialization mirrors the stock move write.
     *
     * @param {Object} record loaded record
     * @param {Number} deltaMs signed shift
     * @returns {Object} write vals
     */
    _tlgShiftedDates(record, deltaMs) {
        const vals = {};
        const start = this.model
            .parseDate(this.model.fields[this.date_start], record[this.date_start])
            .plus({milliseconds: deltaMs});
        vals[this.date_start] = this.model.serializeDate(this.date_start, start);
        if (this.date_stop && record[this.date_stop]) {
            const end = this.model
                .parseDate(this.model.fields[this.date_stop], record[this.date_stop])
                .plus({milliseconds: deltaMs});
            vals[this.date_stop] = this.model.serializeDate(this.date_stop, end);
        }
        return vals;
    },
});
