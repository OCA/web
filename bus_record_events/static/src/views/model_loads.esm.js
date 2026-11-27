import {RelationalModel} from "@web/model/relational_model/relational_model";
import {patch} from "@web/core/utils/patch";
import {toRaw} from "@odoo/owl";

/**
 * ``RelationalModel.load`` runs through a KeepLast: once a newer load starts, an
 * older one never settles. A view button awaits ``model.load()`` inside
 * ``executeButtonCallback``, which disables every button of the view and only
 * enables them again when that promise settles. A refresh from the bus that
 * starts during the button's reload would leave those buttons disabled until the
 * page is reloaded, so the refresh waits for running loads instead.
 *
 * Only the newest load settles, and it settles after every older one is
 * dropped, so the model is idle once the newest load it started has settled.
 */
patch(RelationalModel.prototype, {
    load() {
        const raw = toRaw(this);
        const loadId = (raw.busRecordEventsLoadsStarted ?? 0) + 1;
        raw.busRecordEventsLoadsStarted = loadId;
        const done = () => {
            raw.busRecordEventsLoadsSettled = Math.max(
                raw.busRecordEventsLoadsSettled ?? 0,
                loadId
            );
        };
        const promise = super.load(...arguments);
        promise.then(done, done);
        return promise;
    },

    /**
     * @returns {Boolean}
     */
    get busRecordEventsLoading() {
        const raw = toRaw(this);
        return (
            (raw.busRecordEventsLoadsSettled ?? 0) <
            (raw.busRecordEventsLoadsStarted ?? 0)
        );
    },
});
