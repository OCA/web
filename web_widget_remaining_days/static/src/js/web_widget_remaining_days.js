/* License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_remaining_days', function (require) {
    'use strict';

    var core = require('web.core');
    var session = require('web.session');
    var field_registry = require('web.field_registry');
    var AbstractField = require('web.AbstractField');
    var _t = core._t;

    const RemainingDays = AbstractField.extend({
        supportedFieldTypes: ['date', 'datetime'],
    
        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------
    
        /**
         * Displays the delta (in days) between the value of the field and today. If
         * the delta is larger than 99 days, displays the date as usual (without
         * time).
         *
         * @override
         */
        _render() {
            if (this.value === false) {
                this.$el.removeClass('text-bf text-danger text-warning');
                return;
            }
            // compare the value (in the user timezone) with now (also in the user
            // timezone), to get a meaningful delta for the user
            const nowUTC = moment().utc();
            const nowUserTZ = nowUTC.clone().add(session.getTZOffset(nowUTC), 'minutes');
            const fieldValue = this.field.type == "datetime" ? this.value.clone().add(session.getTZOffset(this.value), 'minutes') : this.value;
            const diffDays = fieldValue.startOf('day').diff(nowUserTZ.startOf('day'), 'days');
            let text;
            if (Math.abs(diffDays) > 99) {
                text = this._formatValue(this.value, 'date');
            } else if (diffDays === 0) {
                text = _t("Today");
            } else if (diffDays < 0) {
                text = diffDays === -1 ? _t("Yesterday") : _.str.sprintf(_t('%s days ago'), -diffDays);
            } else {
                text = diffDays === 1 ? _t("Tomorrow") : _.str.sprintf(_t('In %s days'), diffDays);
            }
            this.$el.text(text).attr('title', this._formatValue(this.value, 'date'));
            this.$el.toggleClass('text-bf', diffDays <= 0);
            this.$el.toggleClass('text-danger', diffDays < 0);
            this.$el.toggleClass('text-warning', diffDays === 0);
        },
    });

    field_registry.add('remaining_days', RemainingDays);

    return {
        RemainingDays: RemainingDays,
    };
});
