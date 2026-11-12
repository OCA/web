/** @odoo-module **/
/* Copyright 2026 Heligrafics Fotogrametria S.L.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {Domain} from "@web/core/domain";
import {SearchModel} from "@web/search/search_model";
import {patch} from "@web/core/utils/patch";

/**
 * Applies the chosen date range in any view, not only in the list: when the user switches
 * to another view of the same action (map, pivot...), the range travels in the exported
 * state and keeps filtering. Without a range nothing changes.
 */
patch(SearchModel.prototype, {
    async load(config) {
        await super.load(...arguments);
        if (config.state?.dateRangeParams) {
            this.dateRangeParams = config.state.dateRangeParams;
        }
    },

    exportState() {
        const state = super.exportState(...arguments);
        if (this.dateRangeParams) {
            state.dateRangeParams = {...this.dateRangeParams};
        }
        return state;
    },

    _getDomain(params = {}) {
        const withGlobal = "withGlobal" in params ? params.withGlobal : true;
        if (!withGlobal || !this.dateRangeParams) {
            return super._getDomain(...arguments);
        }
        const domain = Domain.and([
            this._getDateRangeDomain(),
            super._getDomain({...params, raw: true}),
        ]);
        return params.raw ? domain : domain.toList(this.domainEvalContext);
    },

    /**
     * @param {Object} params
     * @param {String} params.fieldName date or datetime field to filter on
     * @param {String} params.dateRange "today", "yesterday", "last_7_days" or "custom"
     * @param {String} params.fromDate start of the range, serialized for the server
     * @param {String} params.untilDate end of the range, serialized for the server
     */
    setDateRange(params) {
        this.dateRangeParams = {...params};
        this._notify();
    },

    _getDateRangeDomain() {
        const {fieldName, fromDate, untilDate} = this.dateRangeParams;
        return new Domain([
            "&",
            [fieldName, ">=", fromDate],
            [fieldName, "<=", untilDate],
        ]);
    },
});

/**
 * Search model of the `date_range_list` view: returns no record until a range is chosen.
 */
export class DateRangeSearchModel extends SearchModel {
    _getDomain(params = {}) {
        const withGlobal = "withGlobal" in params ? params.withGlobal : true;
        if (!withGlobal || this.dateRangeParams) {
            return super._getDomain(...arguments);
        }
        const domain = Domain.and([
            new Domain([["id", "=", false]]),
            super._getDomain({...params, raw: true}),
        ]);
        return params.raw ? domain : domain.toList(this.domainEvalContext);
    }
}
